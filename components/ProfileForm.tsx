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

    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (updateError) {
      setMessage(`Profile update error: ${updateError.message}`);
      return;
    }

    setAvatar(publicUrl);
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

    // Reload server-side profile data
    router.refresh();
  };

  return (
    <div>
      <div className="mb-10 flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-gray-400">
              {first?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <label className="mt-4 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
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
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            First name
          </label>

          <input
            id="firstName"
            type="text"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Enter your first name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Last name
          </label>

          <input
            id="lastName"
            type="text"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Enter your last name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}