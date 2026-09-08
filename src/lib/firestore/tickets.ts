'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';

async function getDecoded() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.role !== 'admin' && decoded.role !== 'team') throw new Error('Forbidden');
  return decoded;
}

export async function createTicket(subject: string, message: string) {
  const decoded = await getDecoded();
  if (decoded.role !== 'team') throw new Error('Only teams can create tickets');
  const docRef = await adminDb.collection('tickets').add({
    teamId: decoded.uid,
    teamName: decoded.teamName ?? 'Unknown',
    subject,
    messages: [{ sender: 'user', text: message, createdAt: Timestamp.now() }],
    status: 'open',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return { id: docRef.id };
}

export async function listMyTickets() {
  const decoded = await getDecoded();

  if (decoded.role !== 'team') throw new Error('Forbidden');

  const snapshot = await adminDb.collection('tickets')
    .where('teamId', '==', decoded.uid)
    .get();

  return snapshot.docs.map(mapTicket);
}

export async function listAllTickets() {
  const decoded = await getDecoded();
  if (decoded.role !== 'admin') throw new Error('Forbidden');
  const snapshot = await adminDb.collection('tickets')
    .orderBy('updatedAt', 'desc')
    .get();
  return snapshot.docs.map(mapTicket);
}

export async function addTicketReply(ticketId: string, text: string, sender: 'user' | 'admin') {
  const decoded = await getDecoded();
  const ticketDoc = await adminDb.collection('tickets').doc(ticketId).get();
  if (!ticketDoc.exists) throw new Error('Ticket not found');
  const ticket = ticketDoc.data()!;
  if (decoded.role === 'team' && ticket.teamId !== decoded.uid) throw new Error('Forbidden');
  if (decoded.role === 'admin' && sender !== 'admin') throw new Error('Forbidden');
  if (ticket.status !== 'open') throw new Error('Ticket is closed');

  const messages = ticket.messages ?? [];
  messages.push({ sender, text, createdAt: Timestamp.now() });
  await adminDb.collection('tickets').doc(ticketId).update({
    messages,
    updatedAt: Timestamp.now(),
  });
}

export async function closeTicket(ticketId: string) {
  const decoded = await getDecoded();
  if (decoded.role !== 'admin') throw new Error('Forbidden');
  await adminDb.collection('tickets').doc(ticketId).update({
    status: 'closed',
    updatedAt: Timestamp.now(),
  });
}

export async function resolveTicket(ticketId: string) {
  const decoded = await getDecoded();
  if (decoded.role !== 'admin') throw new Error('Forbidden');
  await adminDb.collection('tickets').doc(ticketId).update({
    status: 'resolved',
    updatedAt: Timestamp.now(),
  });
}

function mapTicket(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data();
  return {
    id: doc.id,
    teamId: data.teamId ?? '',
    teamName: data.teamName ?? '',
    subject: data.subject ?? '',
    messages: (data.messages ?? []).map((m: any) => ({
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt?.toDate?.()?.toISOString() ?? '',
    })),
    status: data.status ?? 'open',
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? '',
  };
}