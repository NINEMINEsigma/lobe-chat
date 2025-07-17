import { redirect } from 'next/navigation';

export default function SchedulePage() {
  redirect('/chat?assistant=schedule');
} 