'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types/ticket';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchTickets = async () => {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setTickets(mapRows(data ?? []));
      setLoading(false);
    };

    fetchTickets();

    // Real-time subscription (requires Realtime enabled on the tickets table)
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        async () => {
          // Re-fetch the full sorted list on any change
          const { data } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });
          setTickets(mapRows(data ?? []));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featureRequests = tickets.filter((t) => t.type === 'feature');
  const bugReports = tickets.filter((t) => t.type === 'bug');

  return { tickets, featureRequests, bugReports, loading, error };
}

// ---------- helpers ----------

interface TicketRow {
  id: string;
  title: string | null;
  description: string | null;
  type: string | null;
  status: string | null;
  priority: string | null;
  created_at: string | null;
  submitted_by: string | null;
  screenshot_url: string | null;
}

function mapRows(rows: TicketRow[]): Ticket[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    type: (row.type ?? 'bug') as Ticket['type'],
    status: (row.status ?? 'open') as Ticket['status'],
    priority: (row.priority ?? 'medium') as Ticket['priority'],
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    submittedBy: row.submitted_by ?? 'Unknown',
    screenshotUrl: row.screenshot_url ?? undefined,
  }));
}
