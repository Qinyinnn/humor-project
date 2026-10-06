"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
};

export default function ProfileForm({
  userId,
  firstName,
  lastName,
  avatarUrl,
}: ProfileFormProps) {
  const [first, setFirst] = useState(firstName ?? "");
  const [last, setLast] = useState(lastName ?? "");
  const [avatar, setAvatar] = useState(avatarUrl ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("Uploading photo...");

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      setMessage(`Upload error: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrlWithTimestamp,
      })
      .eq("id", userId);

    if (updateError) {
      setMessage(`Profile update error: ${updateError.message}`);
      return;
    }

    setAvatar(publicUrlWithTimestamp);
    setMessage("Photo updated!");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: first,
        last_name: last,
      })
      .eq("id", userId)
      .select();

    setSaving(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("No profile row was updated.");
      return;
    }

    setMessage("Profile updated successfully!");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-10 flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#d6eafa] bg-[#174f82] shadow-[0_12px_24px_rgba(16,47,77,0.16)]">
          {avatar ? (
            <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-white">
              {first?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <label className="mt-4 cursor-pointer rounded-full border border-[#174f82]/20 bg-white px-4 py-2 text-sm font-semibold text-[#174f82] transition hover:-translate-y-0.5 hover:border-[#174f82]/40 hover:bg-[#edf6fc]">
          Change photo
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-[#17283a]">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Enter your first name"
            className="w-full rounded-2xl border border-[#174f82]/20 bg-[#f9fcfe] px-4 py-3.5 text-[#101c2a] outline-none transition focus:border-[#174f82] focus:ring-2 focus:ring-[#75aadb]/30"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-[#17283a]">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Enter your last name"
            className="w-full rounded-2xl border border-[#174f82]/20 bg-[#f9fcfe] px-4 py-3.5 text-[#101c2a] outline-none transition focus:border-[#174f82] focus:ring-2 focus:ring-[#75aadb]/30"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[#174f82] px-4 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#103b64] disabled:cursor-not-allowed disabled:bg-[#71879a]"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {message && (
          <p className="text-center text-sm text-[#405b73]">{message}</p>
        )}
      </div>
    </div>
  );
}
