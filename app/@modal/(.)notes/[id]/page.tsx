import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
// Шлях імпорту змінився, бо тепер файли лежать поруч в одній папці [id]
import NotePreviewClient from './NotePreview.client'; 
import { fetchNoteById } from '@/lib/api/serverApi';

interface NoteModalProps {
    params: Promise<{ id: string }>;
}

// Назву функції краще змінити на Page, як це прийнято для роутів Next.js
export default async function Page({ params }: NoteModalProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Завантажуємо дані нотатки на сервері
    await queryClient.prefetchQuery({
        queryKey: ['note', id],
        queryFn: () => fetchNoteById(id),
    });

    return (
        // Передаємо завантажені дані на клієнт (гідратація)
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NotePreviewClient noteId={id} />
        </HydrationBoundary>
    );
}