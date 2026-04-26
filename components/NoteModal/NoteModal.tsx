'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchNoteById } from '@/lib/api/clientApi';
import Modal from '@/components/Modal/Modal';
import { Note } from '@/types/note';

type Props = {
    id: string;
};

export default function NoteModal({ id }: Props) {
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);

    useEffect(() => {
        fetchNoteById(id).then(setNote);
    }, [id]);

    const handleClose = () => {
        router.back();
    };

    if (!note) return null;

    return (
        <Modal onClose={handleClose}>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <span>{note.tag}</span>
        </Modal>
    );
}