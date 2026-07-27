'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextInput,
  Stack,
  Text,
  Switch,
  Group,
  Paper,
  Table,
  ActionIcon,
  Badge,
  FileInput,
  Progress,
  Select,
  Textarea,
} from '@mantine/core';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor } from '@mantine/tiptap';
import { IconTrash, IconEdit, IconUpload, IconMovie } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import '@mantine/tiptap/styles.css';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('update');
  const [steps, setSteps] = useState('[]');
  const [version, setVersion] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  
  const ffmpegRef = useRef(new FFmpeg());

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  useEffect(() => {
    fetchAnnouncements();
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    if (!ffmpeg.loaded) {
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        ffmpeg.on('progress', ({ progress }) => {
          setConversionProgress(Math.round(progress * 100));
        });
      } catch (err) {
        console.error("Failed to load FFmpeg", err);
      }
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const processAndUploadVideo = async (videoFile: File): Promise<string | null> => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await loadFFmpeg();
      }

      const inputName = 'input' + videoFile.name.substring(videoFile.name.lastIndexOf('.'));
      const outputName = 'output.gif';

      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Convert to GIF (10 fps, width 800)
      await ffmpeg.exec(['-i', inputName, '-vf', 'fps=10,scale=800:-1:flags=lanczos', outputName]);

      // Read output
      const data = await ffmpeg.readFile(outputName);
      const gifBlob = new Blob([(data as Uint8Array).buffer], { type: 'image/gif' });

      // Upload to Supabase Storage
      setConversionProgress(100);
      const fileName = `${Date.now()}-announcement.gif`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('announcemnt_recordings')
        .upload(fileName, gifBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('announcemnt_recordings')
        .getPublicUrl(fileName);

      setIsConverting(false);
      return publicUrl;

    } catch (err) {
      console.error("Conversion/Upload error", err);
      setIsConverting(false);
      return null;
    }
  };

  const handleSave = async () => {
    if (!title || !version || !editor?.getHTML()) return;

    let finalGifUrl = gifUrl;

    if (file && !editingId) {
      // It's a new upload
      const uploadedUrl = await processAndUploadVideo(file);
      if (uploadedUrl) {
        finalGifUrl = uploadedUrl;
      }
    } else if (file && editingId) {
      // Replaced the upload during edit
      const uploadedUrl = await processAndUploadVideo(file);
      if (uploadedUrl) {
        finalGifUrl = uploadedUrl;
      }
    }

    const content = editor.getHTML();

    if (editingId) {
      const { error } = await supabase
        .from('announcements')
        .update({ title, description, type, steps: JSON.parse(steps || '[]'), version, content, is_active: isActive, gif_url: finalGifUrl })
        .eq('id', editingId);

      if (!error) {
        resetForm();
        fetchAnnouncements();
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert([{ title, description, type, steps: JSON.parse(steps || '[]'), version, content, is_active: isActive, gif_url: finalGifUrl }]);

      if (!error) {
        resetForm();
        fetchAnnouncements();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setType('update');
    setSteps('[]');
    setVersion('');
    setGifUrl('');
    setFile(null);
    setIsActive(true);
    setConversionProgress(0);
    editor?.commands.setContent('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setType(item.type || 'update');
    setSteps(JSON.stringify(item.steps || []));
    setVersion(item.version || '');
    setIsActive(item.is_active);
    setGifUrl(item.gif_url || '');
    setFile(null);
    setConversionProgress(0);
    editor?.commands.setContent(item.content);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      fetchAnnouncements();
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="md" radius="md" withBorder>
        <Text fw={600} mb="md">
          {editingId ? 'Edit Announcement' : 'New Announcement'}
        </Text>
        <Stack gap="sm">
          <Group grow>
            <TextInput
              label="Version"
              placeholder="e.g. v1.2.0"
              value={version}
              onChange={(e) => setVersion(e.currentTarget.value)}
            />
            <Select
              label="Type"
              placeholder="Pick one"
              data={['update', 'feature', 'announcement', 'bugfix']}
              value={type}
              onChange={(val) => setType(val || 'update')}
            />
          </Group>
          <TextInput
            label="Title"
            placeholder="What's new?"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <TextInput
            label="Short Description"
            placeholder="A brief subtitle or summary..."
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Textarea
            label="Onboarding Steps (JSON)"
            placeholder='[{"target": ".my-element", "content": "Click here!"}]'
            value={steps}
            onChange={(e) => setSteps(e.currentTarget.value)}
            minRows={2}
          />
          <Box>
            <Text size="sm" fw={500} mb={3}>Content</Text>
            <RichTextEditor editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.ClearFormatting />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.BulletList />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>
          </Box>
          
          <Box>
            <Text size="sm" fw={500} mb={3}>Screen Recording (Optional)</Text>
            <FileInput
              leftSection={<IconMovie size={16} />}
              placeholder={gifUrl && !file ? 'Current GIF is saved. Select to replace.' : 'Select a video (.mp4, .webm)'}
              accept="video/mp4,video/webm"
              value={file}
              onChange={setFile}
            />
            {isConverting && (
              <Box mt="xs">
                <Text size="xs" c="dimmed" mb={4}>Processing Video to GIF... {conversionProgress}%</Text>
                <Progress value={conversionProgress} color="warmGold" animated />
              </Box>
            )}
            {gifUrl && !file && !isConverting && (
              <Text size="xs" c="green" mt={4}>Has attached recording: {gifUrl.substring(0, 50)}...</Text>
            )}
          </Box>

          <Group justify="space-between" mt="sm">
            <Switch
              label="Active"
              checked={isActive}
              onChange={(event) => setIsActive(event.currentTarget.checked)}
            />
            <Group>
              {editingId && (
                <Button variant="subtle" onClick={resetForm} disabled={isConverting}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} color="warmGold" loading={isConverting}>
                {editingId ? 'Update' : 'Publish'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Text fw={600} mb="md">Published Announcements</Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Version</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Media</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {announcements.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.version}</Table.Td>
                <Table.Td>
                  <Badge color="cyan" variant="outline">{item.type}</Badge>
                </Table.Td>
                <Table.Td>{item.title}</Table.Td>
                <Table.Td>
                  {item.gif_url ? <Badge color="blue" variant="light">GIF</Badge> : <Text size="xs" c="dimmed">None</Text>}
                </Table.Td>
                <Table.Td>
                  {item.is_active ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="gray">Draft/Inactive</Badge>
                  )}
                </Table.Td>
                <Table.Td>{new Date(item.created_at).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
