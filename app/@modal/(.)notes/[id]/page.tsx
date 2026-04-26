import NoteModal from '@/components/NoteModal/NoteModal';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function NoteModalPage({ params }: Props) {
    const { id } = await params;
    return <NoteModal id={id} />;
}