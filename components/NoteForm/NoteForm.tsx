'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api/clientApi';
import { useDraftStore } from '@/lib/store/noteStore';
import type { NoteTag } from '@/types/note';
import css from './NoteForm.module.css';

const tagOptions: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useDraftStore();

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      clearDraft();
      router.back();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.title || !draft.tag) return;
    await createNoteMutation.mutateAsync({
      title: draft.title.trim(),
      content: draft.content.trim(),
      tag: draft.tag,
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <label className={css.formGroup}>
        <span>Title</span>
        <input
          className={css.input}
          type="text"
          name="title"
          value={draft.title}
          onChange={(e) => setDraft({ title: e.target.value })}
        />
      </label>

      <label className={css.formGroup}>
        <span>Content</span>
        <textarea
          className={css.textarea}
          name="content"
          rows={6}
          value={draft.content}
          onChange={(e) => setDraft({ content: e.target.value })}
        />
      </label>

      <label className={css.formGroup}>
        <span>Tag</span>
        <select
          className={css.select}
          name="tag"
          value={draft.tag}
          onChange={(e) => setDraft({ tag: e.target.value as NoteTag })}
        >
          {tagOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <div className={css.actions}>
        <button className={css.cancelButton} type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className={css.submitButton}
          type="submit"
          disabled={createNoteMutation.isPending}
        >
          {createNoteMutation.isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
}