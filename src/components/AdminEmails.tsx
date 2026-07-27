"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextInput,
  Stack,
  Text,
  Paper,
  Group,
  Alert,
  Table,
  Checkbox,
  Loader,
  Center,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Stepper,
  Grid,
  Divider,
  SegmentedControl,
  Textarea,
  Menu,
  Avatar,
  Popover,
  Select,
  Drawer,
} from "@mantine/core";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import {
  IconSend,
  IconInfoCircle,
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconUser,
  IconArrowRight,
  IconArrowLeft,
  IconCode,
  IconEditCircle,
} from "@tabler/icons-react";
import "@mantine/tiptap/styles.css";

type AppUser = {
  id: string;
  email: string;
  name: string;
  surname: string;
  created_at: string;
  last_activity: string;
  user_profile?: string;
};

type SortKey = keyof AppUser;

const TEMPLATES = [
  {
    name: "Standard Tempas Update",
    mode: "visual" as const,
    subject: "What's New in Tempas",
    headline: "What's New in Tempas",
    body: "<p>Hi {{name}},</p><p>Check out what we have been working on!</p>",
  },
  {
    name: "Monthly Newsletter (Web Style)",
    mode: "raw" as const,
    subject: "Your Monthly Tempas Digest",
    headline: "",
    body: `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#f6f9fc; font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden;">
    <tr>
      <td style="padding:20px; text-align:center; border-bottom:1px solid #eaeaea;">
        <img src="https://www.tempas.io/icon-512.png" width="40" alt="Tempas" />
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <div style="background-color:#E9F5FF; padding:40px 20px; text-align:center;">
          <h1 style="color:#003366; margin:0 0 10px 0;">Monthly Digest</h1>
          <p style="color:#333333; margin:0; font-size:16px;">Everything you need to know this month.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 30px;">
        <p>Hi {{name}},</p>
        <p>We've added a ton of new features to help you work faster and smarter. Dive in and explore what's new!</p>
        <div style="text-align:center; margin-top:30px;">
          <a href="https://tempas.io" style="background-color:#D4A017; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">Explore Now</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px; text-align:center; background-color:#fafafa; font-size:12px; color:#8898aa;">
        Sent securely from Tempas.<br/>
        <a href="#" style="color:#8898aa;">Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Minimal Plain Text",
    mode: "raw" as const,
    subject: "A quick question for you, {{name}}",
    headline: "",
    body: `<div style="font-family:sans-serif; font-size:16px; color:#333; max-width:600px; margin:0 auto; padding:20px;">
  <p>Hey {{name}},</p>
  <p>I just wanted to personally reach out and ask if you had any feedback on your recent experience with Tempas?</p>
  <p>Just hit reply and let me know.</p>
  <br/>
  <p>Best,<br/>The Tempas Team</p>
</div>`,
  },
];

export default function AdminEmails() {
  const [activeStep, setActiveStep] = useState(0);

  // Template Mode
  const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
  const [rawHtml, setRawHtml] = useState(
    '<!-- Paste your custom HTML here -->\n<h1 style="text-align: center; font-family: sans-serif;">Hello {{name}}</h1>\n<p style="text-align: center; font-family: sans-serif;">This is a custom template!</p>',
  );

  // Visual Form State
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("What's New in Tempas");
  const [ctaText, setCtaText] = useState("Go to Dashboard");
  const [ctaLink, setCtaLink] = useState("https://tempas.com");

  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Users grid state
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>({ key: "last_activity", direction: "desc" });
  const [profileDrawerUser, setProfileDrawerUser] = useState<AppUser | null>(
    null,
  );

  // Filtering State
  const [preset, setPreset] = useState<string | null>(null);
  const [colFilters, setColFilters] = useState({
    name: "",
    email: "",
    lastActiveOp: "before",
    lastActiveDate: "",
    joinedOp: "before",
    joinedDate: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content:
      "<p>Hi {{name}},</p><p>Check out what we have been working on!</p>",
    onUpdate: ({ editor }) => {
      setPreviewHtml(editor.getHTML());
    },
  });

  const [previewHtml, setPreviewHtml] = useState(editor?.getHTML() || "");

  useEffect(() => {
    if (editor && previewHtml === "") {
      setPreviewHtml(editor.getHTML());
    }
  }, [editor]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = [...users];

    // Main search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.email || "").toLowerCase().includes(q) ||
          (u.name || "").toLowerCase().includes(q) ||
          (u.surname || "").toLowerCase().includes(q),
      );
    }

    // Presets
    if (preset === "never_logged_in") {
      filtered = filtered.filter((u) => {
        if (!u.last_activity || !u.created_at) return false;
        // Compare dates roughly (if they are exactly the same timestamp or within a minute)
        return (
          new Date(u.last_activity).getTime() -
            new Date(u.created_at).getTime() <
          60000
        );
      });
    } else if (preset === "inactive_30" || preset === "inactive_90") {
      const days = preset === "inactive_30" ? 30 : 90;
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);
      filtered = filtered.filter((u) => {
        if (!u.last_activity) return true;
        return new Date(u.last_activity) < threshold;
      });
    }

    // Manual Column Filters
    if (colFilters.name) {
      filtered = filtered.filter((u) =>
        `${u.name || ""} ${u.surname || ""}`
          .toLowerCase()
          .includes(colFilters.name.toLowerCase()),
      );
    }
    if (colFilters.email) {
      filtered = filtered.filter((u) =>
        (u.email || "").toLowerCase().includes(colFilters.email.toLowerCase()),
      );
    }
    if (colFilters.lastActiveDate) {
      const filterDate = new Date(colFilters.lastActiveDate).getTime();
      filtered = filtered.filter((u) => {
        if (!u.last_activity) return false;
        const uDate = new Date(u.last_activity).getTime();
        return colFilters.lastActiveOp === "before"
          ? uDate < filterDate
          : uDate > filterDate;
      });
    }
    if (colFilters.joinedDate) {
      const filterDate = new Date(colFilters.joinedDate).getTime();
      filtered = filtered.filter((u) => {
        if (!u.created_at) return false;
        const uDate = new Date(u.created_at).getTime();
        return colFilters.joinedOp === "before"
          ? uDate < filterDate
          : uDate > filterDate;
      });
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";

        if (
          sortConfig.key === "created_at" ||
          sortConfig.key === "last_activity"
        ) {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, search, preset, colFilters, sortConfig]);

  const allSelected =
    sortedAndFilteredUsers.length > 0 &&
    selectedUsers.length === sortedAndFilteredUsers.length;
  const indeterminate =
    selectedUsers.length > 0 &&
    selectedUsers.length < sortedAndFilteredUsers.length;

  const loadTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setEditorMode(t.mode);
    setSubject(t.subject);
    setHeadline(t.headline);
    if (t.mode === "visual") {
      editor?.commands.setContent(t.body);
    } else {
      setRawHtml(t.body);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...sortedAndFilteredUsers]);
    }
  };

  const toggleRow = (user: AppUser) => {
    setSelectedUsers((current) =>
      current.find((u) => u.id === user.id)
        ? current.filter((u) => u.id !== user.id)
        : [...current, user],
    );
  };

  const insertVariable = (into: "subject" | "body" | "raw") => {
    if (into === "subject") {
      setSubject((s) => s + " {{name}}");
    } else if (into === "body" && editor) {
      editor.chain().focus().insertContent("{{name}}").run();
    } else if (into === "raw") {
      setRawHtml((s) => s + "{{name}}");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAvatarSrc = (profileStr?: string) => {
    if (!profileStr) return undefined;
    try {
      const parsed = JSON.parse(profileStr);
      return (
        parsed.avatar_url ||
        parsed.avatar ||
        parsed.picture ||
        parsed.image ||
        parsed.profile_url ||
        undefined
      );
    } catch {
      return profileStr;
    }
  };

  const nextStep = () => {
    if (activeStep === 0 && selectedUsers.length === 0) {
      setStatus({
        type: "error",
        message: "Please select at least one user to proceed.",
      });
      return;
    }
    if (activeStep === 1) {
      if (!subject) {
        setStatus({ type: "error", message: "Subject is required." });
        return;
      }
      if (editorMode === "visual" && (!headline || !previewHtml)) {
        setStatus({
          type: "error",
          message: "Headline and Body are required in Visual mode.",
        });
        return;
      }
      if (editorMode === "raw" && !rawHtml.trim()) {
        setStatus({
          type: "error",
          message: "HTML Code is required in Raw HTML mode.",
        });
        return;
      }
    }
    setStatus(null);
    setActiveStep((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current));

  const handleSend = async () => {
    const confirmSend = window.confirm(
      `Are you sure you want to send this email to ${selectedUsers.length} user(s)?`,
    );
    if (!confirmSend) return;

    setIsSending(true);
    setStatus(null);

    try {
      const payload = {
        subject,
        headline: editorMode === "visual" ? headline : undefined,
        htmlBody: editorMode === "visual" ? previewHtml : undefined,
        ctaText: editorMode === "visual" ? ctaText : undefined,
        ctaLink: editorMode === "visual" ? ctaLink : undefined,
        isRawHtml: editorMode === "raw",
        rawHtmlBody: editorMode === "raw" ? rawHtml : undefined,
        recipients: selectedUsers,
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setStatus({
        type: "success",
        message: `Successfully fired off campaign to ${data.count || 0} users!`,
      });
      setActiveStep(0);
      setSelectedUsers([]);
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Failed to connect to API",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setStatus({ type: "error", message: "Please enter a test email address." });
      return;
    }

    setIsSendingTest(true);
    setStatus(null);

    try {
      const payload = {
        subject: `[TEST] ${subject}`,
        headline: editorMode === "visual" ? headline : undefined,
        htmlBody: editorMode === "visual" ? previewHtml : undefined,
        ctaText: editorMode === "visual" ? ctaText : undefined,
        ctaLink: editorMode === "visual" ? ctaLink : undefined,
        isRawHtml: editorMode === "raw",
        rawHtmlBody: editorMode === "raw" ? rawHtml : undefined,
        recipients: [{ email: testEmail, name: "Test User" }],
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      setStatus({ type: "success", message: "Test email sent successfully!" });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", message: err.message || "Failed to send test email" });
    } finally {
      setIsSendingTest(false);
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <IconSortAscending size={14} />
    ) : (
      <IconSortDescending size={14} />
    );
  };

  // Replace variable for the preview mock
  const previewReplacedHtml = previewHtml.replace(/\{\{name\}\}/g, "JohnDoe");
  const rawReplacedHtml = rawHtml.replace(/\{\{name\}\}/g, "JohnDoe");
  const subjectReplaced = subject.replace(/\{\{name\}\}/g, "JohnDoe");

  return (
    <Stack gap="md" h="calc(100vh - 100px)">
      {status && (
        <Alert
          icon={
            status.type === "error" ? (
              <IconAlertCircle size={16} />
            ) : (
              <IconInfoCircle size={16} />
            )
          }
          title={status.type === "error" ? "Error" : "Success"}
          color={status.type === "error" ? "red" : "green"}
          withCloseButton
          onClose={() => setStatus(null)}
        >
          {status.message}
        </Alert>
      )}

      <Paper
        p="xl"
        radius="md"
        withBorder
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          color="warmGold"
          allowNextStepsSelect={false}
        >
          <Stepper.Step label="Audience" description="Select recipients">
            <Stack
              gap="md"
              mt="xl"
              style={{ flex: 1, height: "calc(100vh - 280px)" }}
            >
              <Group justify="space-between">
                <Box>
                  <Text fw={600}>Select Recipients</Text>
                  <Text size="sm" c="dimmed">
                    Filter and select which users will receive this email blast.
                    ({users.length} total users, {selectedUsers.length}{" "}
                    selected)
                  </Text>
                </Box>
                <Group gap="sm">
                  <TextInput
                    placeholder="Search all..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    size="sm"
                  />
                  <Select
                    placeholder="Filter Presets"
                    value={preset}
                    onChange={setPreset}
                    data={[
                      {
                        value: "never_logged_in",
                        label: "Never Logged In (Create Date = Last Seen)",
                      },
                      { value: "inactive_30", label: "Inactive for 30+ Days" },
                      { value: "inactive_90", label: "Inactive for 90+ Days" },
                    ]}
                    clearable
                  />
                </Group>
              </Group>

              {loadingUsers ? (
                <Center style={{ flex: 1 }}>
                  <Loader color="warmGold" type="bars" />
                </Center>
              ) : (
                <Box
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid var(--mantine-color-default-border)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <ScrollArea style={{ flex: 1 }}>
                    <Table
                      stickyHeader
                      stickyHeaderOffset={0}
                      striped
                      highlightOnHover
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: 40, zIndex: 2 }}>
                            <Checkbox
                              checked={allSelected}
                              indeterminate={indeterminate}
                              onChange={toggleAll}
                              color="warmGold"
                            />
                          </Table.Th>
                          <Table.Th style={{ zIndex: 2 }}>
                            <Group gap={4} justify="space-between">
                              <Box
                                style={{ cursor: "pointer", flex: 1 }}
                                onClick={() => handleSort("name")}
                              >
                                Name {renderSortIcon("name")}
                              </Box>
                              <Popover
                                width={250}
                                position="bottom-end"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <ActionIcon
                                    variant={
                                      colFilters.name ? "filled" : "subtle"
                                    }
                                    color="warmGold"
                                    size="sm"
                                  >
                                    <IconFilter size={14} />
                                  </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                  <TextInput
                                    label="Name contains"
                                    value={colFilters.name}
                                    onChange={(e) =>
                                      setColFilters({
                                        ...colFilters,
                                        name: e.currentTarget.value,
                                      })
                                    }
                                  />
                                </Popover.Dropdown>
                              </Popover>
                            </Group>
                          </Table.Th>
                          <Table.Th style={{ zIndex: 2 }}>
                            <Group gap={4} justify="space-between">
                              <Box
                                style={{ cursor: "pointer", flex: 1 }}
                                onClick={() => handleSort("email")}
                              >
                                Email {renderSortIcon("email")}
                              </Box>
                              <Popover
                                width={250}
                                position="bottom-end"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <ActionIcon
                                    variant={
                                      colFilters.email ? "filled" : "subtle"
                                    }
                                    color="warmGold"
                                    size="sm"
                                  >
                                    <IconFilter size={14} />
                                  </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                  <TextInput
                                    label="Email contains"
                                    value={colFilters.email}
                                    onChange={(e) =>
                                      setColFilters({
                                        ...colFilters,
                                        email: e.currentTarget.value,
                                      })
                                    }
                                  />
                                </Popover.Dropdown>
                              </Popover>
                            </Group>
                          </Table.Th>
                          <Table.Th style={{ zIndex: 2 }}>
                            <Group gap={4} justify="space-between">
                              <Box
                                style={{ cursor: "pointer", flex: 1 }}
                                onClick={() => handleSort("last_activity")}
                              >
                                Last Seen {renderSortIcon("last_activity")}
                              </Box>
                              <Popover
                                width={250}
                                position="bottom-end"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <ActionIcon
                                    variant={
                                      colFilters.lastActiveDate
                                        ? "filled"
                                        : "subtle"
                                    }
                                    color="warmGold"
                                    size="sm"
                                  >
                                    <IconFilter size={14} />
                                  </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                  <Stack gap="xs">
                                    <Select
                                      label="Operator"
                                      value={colFilters.lastActiveOp}
                                      onChange={(v) =>
                                        setColFilters({
                                          ...colFilters,
                                          lastActiveOp: v || "before",
                                        })
                                      }
                                      data={[
                                        { value: "before", label: "Before" },
                                        { value: "after", label: "After" },
                                      ]}
                                    />
                                    <TextInput
                                      type="date"
                                      label="Date"
                                      value={colFilters.lastActiveDate}
                                      onChange={(e) =>
                                        setColFilters({
                                          ...colFilters,
                                          lastActiveDate: e.currentTarget.value,
                                        })
                                      }
                                    />
                                  </Stack>
                                </Popover.Dropdown>
                              </Popover>
                            </Group>
                          </Table.Th>
                          <Table.Th style={{ zIndex: 2 }}>
                            <Group gap={4} justify="space-between">
                              <Box
                                style={{ cursor: "pointer", flex: 1 }}
                                onClick={() => handleSort("created_at")}
                              >
                                Joined {renderSortIcon("created_at")}
                              </Box>
                              <Popover
                                width={250}
                                position="bottom-end"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <ActionIcon
                                    variant={
                                      colFilters.joinedDate
                                        ? "filled"
                                        : "subtle"
                                    }
                                    color="warmGold"
                                    size="sm"
                                  >
                                    <IconFilter size={14} />
                                  </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                  <Stack gap="xs">
                                    <Select
                                      label="Operator"
                                      value={colFilters.joinedOp}
                                      onChange={(v) =>
                                        setColFilters({
                                          ...colFilters,
                                          joinedOp: v || "before",
                                        })
                                      }
                                      data={[
                                        { value: "before", label: "Before" },
                                        { value: "after", label: "After" },
                                      ]}
                                    />
                                    <TextInput
                                      type="date"
                                      label="Date"
                                      value={colFilters.joinedDate}
                                      onChange={(e) =>
                                        setColFilters({
                                          ...colFilters,
                                          joinedDate: e.currentTarget.value,
                                        })
                                      }
                                    />
                                  </Stack>
                                </Popover.Dropdown>
                              </Popover>
                            </Group>
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {sortedAndFilteredUsers.length === 0 ? (
                          <Table.Tr>
                            <Table.Td colSpan={5}>
                              <Text ta="center" c="dimmed" py="md">
                                No users found.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ) : (
                          sortedAndFilteredUsers.map((u) => {
                            const isSelected = !!selectedUsers.find(
                              (su) => su.id === u.id,
                            );
                            const fullName =
                              u.name || u.surname
                                ? `${u.name || ""} ${u.surname || ""}`.trim()
                                : "—";
                            return (
                              <Table.Tr
                                key={u.id}
                                bg={
                                  isSelected
                                    ? "var(--mantine-color-warmGold-light)"
                                    : undefined
                                }
                              >
                                <Table.Td>
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => toggleRow(u)}
                                    color="warmGold"
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <Group
                                    gap="sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setProfileDrawerUser(u)}
                                  >
                                    <Avatar
                                      src={getAvatarSrc(u.user_profile)}
                                      radius="xl"
                                      size="sm"
                                      color="warmGold"
                                    >
                                      {u.name?.charAt(0) ||
                                        u.email.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Text size="sm">{fullName}</Text>
                                  </Group>
                                </Table.Td>
                                <Table.Td>{u.email}</Table.Td>
                                <Table.Td>
                                  {formatDate(u.last_activity)}
                                </Table.Td>
                                <Table.Td>{formatDate(u.created_at)}</Table.Td>
                              </Table.Tr>
                            );
                          })
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Box>
              )}
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Compose" description="Draft & Preview">
            <Group justify="space-between" mt="xl" mb="md">
              <Group gap="sm">
                <Text fw={600} size="lg">
                  Editor Mode
                </Text>
                <SegmentedControl
                  value={editorMode}
                  onChange={(value) => setEditorMode(value as "visual" | "raw")}
                  data={[
                    {
                      label: (
                        <Center>
                          <IconEditCircle
                            size={16}
                            style={{ marginRight: 6 }}
                          />{" "}
                          Visual Editor
                        </Center>
                      ),
                      value: "visual",
                    },
                    {
                      label: (
                        <Center>
                          <IconCode size={16} style={{ marginRight: 6 }} /> Raw
                          HTML Mode
                        </Center>
                      ),
                      value: "raw",
                    },
                  ]}
                />
              </Group>

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="outline" color="warmGold">
                    Load Template
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Pre-built Templates</Menu.Label>
                  {TEMPLATES.map((t, idx) => (
                    <Menu.Item key={idx} onClick={() => loadTemplate(idx)}>
                      {t.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Grid mt="md" gutter="xl">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={500}>
                        Email Subject
                      </Text>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        color="blue"
                        onClick={() => insertVariable("subject")}
                        leftSection={<IconUser size={12} />}
                      >
                        Insert {"{{name}}"}
                      </Button>
                    </Group>
                    <TextInput
                      placeholder="e.g. Exciting new updates to Tempas!"
                      value={subject}
                      onChange={(e) => setSubject(e.currentTarget.value)}
                      required
                    />
                  </Box>

                  {editorMode === "visual" ? (
                    <>
                      <TextInput
                        label="Header Headline"
                        placeholder="e.g. What's New in Tempas"
                        value={headline}
                        onChange={(e) => setHeadline(e.currentTarget.value)}
                        required
                      />

                      <Box>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" fw={500}>
                            Email Body
                          </Text>
                          <Button
                            variant="light"
                            size="compact-xs"
                            color="blue"
                            onClick={() => insertVariable("body")}
                            leftSection={<IconUser size={12} />}
                          >
                            Insert {"{{name}}"}
                          </Button>
                        </Group>
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

                      <Group grow>
                        <TextInput
                          label="Primary Button Text"
                          placeholder="e.g. Go to Dashboard"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.currentTarget.value)}
                        />
                        <TextInput
                          label="Primary Button URL"
                          placeholder="e.g. https://tempas.com"
                          value={ctaLink}
                          onChange={(e) => setCtaLink(e.currentTarget.value)}
                        />
                      </Group>
                    </>
                  ) : (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={500}>
                          Raw HTML Code
                        </Text>
                        <Button
                          variant="light"
                          size="compact-xs"
                          color="blue"
                          onClick={() => insertVariable("raw")}
                          leftSection={<IconUser size={12} />}
                        >
                          Insert {"{{name}}"}
                        </Button>
                      </Group>
                      <Textarea
                        placeholder="Paste your fully customized HTML template here..."
                        value={rawHtml}
                        onChange={(e) => setRawHtml(e.currentTarget.value)}
                        minRows={20}
                        autosize
                        styles={{
                          input: { fontFamily: "monospace", fontSize: 13 },
                        }}
                      />
                      <Text size="xs" c="dimmed" mt={4}>
                        This HTML will bypass the Tempas wrapper and be sent
                        exactly as is.
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={600} mb="sm">
                  Live Preview
                </Text>

                <Box
                  bg="#f6f9fc"
                  p="xl"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #eaeaea",
                    minHeight: 600,
                    overflowY: "auto",
                  }}
                >
                  {editorMode === "visual" ? (
                    <Paper
                      bg="white"
                      p="xl"
                      radius="md"
                      shadow="sm"
                      maw={600}
                      mx="auto"
                      style={{
                        fontFamily:
                          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
                      }}
                    >
                      <Center mb="lg">
                        <img
                          src="https://www.tempas.io/icon-512.png"
                          alt="Logo"
                          width={48}
                          height={48}
                          style={{ borderRadius: 8, objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </Center>

                      {headline && (
                        <Text
                          fz={24}
                          fw={600}
                          ta="center"
                          mb="lg"
                          c="#333"
                          style={{ lineHeight: 1.25 }}
                        >
                          {headline}
                        </Text>
                      )}

                      <Box
                        c="#444"
                        fz={16}
                        style={{ lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{
                          __html: previewReplacedHtml,
                        }}
                      />

                      {ctaText && ctaLink && (
                        <Center mt={32} mb={32}>
                          <Button
                            component="a"
                            href={ctaLink}
                            target="_blank"
                            bg="#D4A017"
                            size="md"
                            radius="md"
                            style={{ pointerEvents: "none" }}
                          >
                            {ctaText}
                          </Button>
                        </Center>
                      )}

                      <Divider mt="xl" mb="lg" />
                      <Text ta="center" fz={12} c="#8898aa">
                        Sent securely from Tempas.
                        <br />
                        <span style={{ textDecoration: "underline" }}>
                          Unsubscribe
                        </span>{" "}
                        •{" "}
                        <span style={{ textDecoration: "underline" }}>
                          Tempas Home
                        </span>
                      </Text>
                    </Paper>
                  ) : (
                    // Raw HTML Render exactly as provided
                    <Box
                      w="100%"
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                      dangerouslySetInnerHTML={{ __html: rawReplacedHtml }}
                    />
                  )}
                </Box>
              </Grid.Col>
            </Grid>
          </Stepper.Step>

          <Stepper.Step label="Review" description="Final Check">
            <Center mt={40} mb={20}>
              <Paper
                p="xl"
                radius="md"
                withBorder
                w="100%"
                maw={500}
                ta="center"
              >
                <IconSend
                  size={48}
                  color="var(--mantine-color-warmGold-6)"
                  style={{ marginBottom: 16 }}
                />
                <Text fw={700} fz="xl" mb="sm">
                  Ready to blast!
                </Text>
                <Text c="dimmed" mb="xl">
                  You are about to send the{" "}
                  {editorMode === "raw" ? "Raw HTML" : "Standard"} campaign{" "}
                  <strong>"{subjectReplaced}"</strong> to{" "}
                  <strong>{selectedUsers.length}</strong> selected users.
                </Text>

                <Box
                  bg="gray.0"
                  p="md"
                  radius="md"
                  mb="xl"
                  style={{ textAlign: "left" }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600}>
                      Subject:
                    </Text>
                    <Text size="sm">{subjectReplaced}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Recipients:
                    </Text>
                    <Text size="sm">{selectedUsers.length} Users</Text>
                  </Group>
                  <Group justify="space-between" mt="xs">
                    <Text size="sm" fw={600}>
                      Mode:
                    </Text>
                    <Text size="sm" tt="capitalize">
                      {editorMode}
                    </Text>
                  </Group>
                </Box>

                <Button
                  size="lg"
                  color="warmGold"
                  fullWidth
                  onClick={handleSend}
                  loading={isSending}
                  mb="xl"
                >
                  Confirm & Send Campaign
                </Button>

                <Divider my="md" label="Or send a test" labelPosition="center" />
                <Box mt="md" ta="left">
                  <TextInput
                    placeholder="Enter test email address..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.currentTarget.value)}
                    mb="sm"
                  />
                  <Button
                    variant="outline"
                    color="warmGold"
                    fullWidth
                    onClick={handleSendTest}
                    loading={isSendingTest}
                  >
                    Send Test Email
                  </Button>
                </Box>
              </Paper>
            </Center>
          </Stepper.Step>

          <Stepper.Completed>
            <Center mt={60}>
              <Stack align="center">
                <Text size="xl" fw={700}>
                  Campaign Sent!
                </Text>
                <Button
                  onClick={() => setActiveStep(0)}
                  variant="light"
                  color="warmGold"
                >
                  Start New Campaign
                </Button>
              </Stack>
            </Center>
          </Stepper.Completed>
        </Stepper>

        {activeStep < 3 && (
          <Group justify="space-between" mt="xl" style={{ marginTop: "auto" }}>
            <Button
              variant="default"
              onClick={prevStep}
              disabled={activeStep === 0}
              leftSection={<IconArrowLeft size={16} />}
            >
              Back
            </Button>
            {activeStep < 2 && (
              <Button
                onClick={nextStep}
                color="warmGold"
                rightSection={<IconArrowRight size={16} />}
              >
                Next Step
              </Button>
            )}
          </Group>
        )}
      </Paper>

      <Drawer
        opened={!!profileDrawerUser}
        onClose={() => setProfileDrawerUser(null)}
        title={
          <Text fw={700} size="lg">
            User Profile
          </Text>
        }
        position="right"
        size="md"
        padding="xl"
      >
        {profileDrawerUser && (
          <Stack gap="xl">
            <Center>
              <Avatar
                src={getAvatarSrc(profileDrawerUser.user_profile)}
                size={120}
                radius="100%"
                color="warmGold"
              >
                {profileDrawerUser.name?.charAt(0) ||
                  profileDrawerUser.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Center>
            <Box ta="center">
              <Text fw={700} size="xl">
                {profileDrawerUser.name || profileDrawerUser.surname
                  ? `${profileDrawerUser.name || ""} ${profileDrawerUser.surname || ""}`.trim()
                  : "No Name Set"}
              </Text>
              <Text c="dimmed">{profileDrawerUser.email}</Text>
            </Box>

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed" mb={4}>
                  Joined
                </Text>
                <Text fw={500}>{formatDate(profileDrawerUser.created_at)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed" mb={4}>
                  Last Seen
                </Text>
                <Text fw={500}>
                  {formatDate(profileDrawerUser.last_activity)}
                </Text>
              </Grid.Col>
            </Grid>

            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                Raw Profile Data
              </Text>
              <Paper bg="gray.0" p="sm" radius="md">
                <Text
                  size="xs"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                >
                  {profileDrawerUser.user_profile
                    ? profileDrawerUser.user_profile
                    : "No profile data available."}
                </Text>
              </Paper>
            </Box>

            <Button
              color="warmGold"
              variant="light"
              fullWidth
              mt="md"
              onClick={() => setProfileDrawerUser(null)}
            >
              Close Profile
            </Button>
          </Stack>
        )}
      </Drawer>
    </Stack>
  );
}
