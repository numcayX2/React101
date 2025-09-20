import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Member = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  party: string;
  workHistory: string;
  position?: string;
  ministry?: string;
  photoUrl: string;
};

const STORAGE_KEY = "houseMembers";

const formSchema = z.object({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  party: z.string().min(1, "กรุณากรอกพรรคการเมือง"),
  workHistory: z.string().min(1, "กรุณากรอกประวัติ/ผลงาน"),
  position: z.string().optional(),
  ministry: z.string().optional(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HouseMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setMembers(JSON.parse(raw));
      } catch (error) {
        console.error(
          "Failed to parse house members from localStorage:",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "นาย",
      firstName: "",
      lastName: "",
      party: "",
      workHistory: "",
      position: "",
      ministry: "",
    },
  });

  const photoWatch = watch("photo");
  useEffect(() => {
    if (photoWatch instanceof FileList && photoWatch.length > 0) {
      const url = URL.createObjectURL(photoWatch[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [photoWatch]);

  const onSubmit = handleSubmit(async (data) => {
    const isEditing = Boolean(editingId);
    let photoUrl: string | null = null;

    if (data.photo instanceof FileList && data.photo.length > 0) {
      const file = data.photo[0];
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5_000_000
      ) {
        setError("photo", { message: "รองรับ JPG/PNG/WEBP และไม่เกิน 5MB" });
        return;
      }
      photoUrl = await fileToDataUrl(file);
    }

    if (isEditing) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                title: data.title,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                party: data.party.trim(),
                workHistory: data.workHistory.trim(),
                position: data.position?.trim() || undefined,
                ministry: data.ministry?.trim() || undefined,
                photoUrl: photoUrl ?? m.photoUrl,
              }
            : m
        )
      );
      setEditingId(null);
    } else {
      if (!(data.photo instanceof FileList) || data.photo.length === 0) {
        setError("photo", { message: "กรุณาเลือกรูปถ่าย" });
        return;
      }
      if (!photoUrl) {
        const file = data.photo[0];
        photoUrl = await fileToDataUrl(file);
      }
      const newMember: Member = {
        id: crypto.randomUUID(),
        title: data.title,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        party: data.party.trim(),
        workHistory: data.workHistory.trim(),
        position: data.position?.trim() || undefined,
        ministry: data.ministry?.trim() || undefined,
        photoUrl: photoUrl,
      };
      setMembers((prev) => [newMember, ...prev]);
    }

    reset({
      title: "นาย",
      firstName: "",
      lastName: "",
      party: "",
      workHistory: "",
      position: "",
      ministry: "",
    });
    setPreview(null);
  });

  const handleEdit = (m: Member) => {
    setEditingId(m.id);
    reset({
      title: m.title,
      firstName: m.firstName,
      lastName: m.lastName,
      party: m.party,
      workHistory: m.workHistory,
      position: m.position || "",
      ministry: m.ministry || "",
    });
    setPreview(m.photoUrl);
  };

  const handleCancel = () => {
    setEditingId(null);
    reset({
      title: "นาย",
      firstName: "",
      lastName: "",
      party: "",
      workHistory: "",
      position: "",
      ministry: "",
    });
    setPreview(null);
  };

  const handleDelete = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) handleCancel();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white">
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            สภาผู้แทนราษฎร
          </span>
        </h2>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow p-6 space-y-6"
        >
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                {...register("title")}
              >
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
                <option>ดร.</option>
              </select>
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                พรรคการเมือง
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                {...register("party")}
              />
              {errors.party && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.party.message}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Work + positions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประวัติ/ผลงาน
              </label>
              <textarea
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 min-h-28 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                {...register("workHistory")}
              />
              {errors.workHistory && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.workHistory.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำแหน่งรัฐมนตรี
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                  {...register("position")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  กระทรวง
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60"
                  {...register("ministry")}
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปถ่าย 2 นิ้ว
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                {...register("photo")}
              />
              {errors.photo && (
                <p className="text-red-600 text-xs mt-1">
                  {String(errors.photo.message)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                รองรับ JPG/PNG/WEBP ไม่เกิน 5MB
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="ตัวอย่าง"
                  className="h-28 w-28 rounded-xl object-cover border border-gray-200 ring-1 ring-emerald-200/60"
                />
              ) : (
                <div className="h-28 w-28 rounded-xl border border-dashed border-gray-300 grid place-items-center text-xs text-gray-500">
                  ไม่มีรูป
                </div>
              )}
              <span className="text-sm text-gray-600">
                {editingId
                  ? "อัปโหลดรูปเพื่อแทนที่รูปเดิม"
                  : "ตัวอย่างจะแสดงหลังเลือกไฟล์"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 active:scale-[.99] transition"
            >
              {editingId ? "อัปเดตสมาชิก" : "เพิ่มสมาชิก"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/60"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        {/* Members list */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">รายการสมาชิก</h3>
          {members.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีสมาชิก</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-4 shadow-sm hover:shadow-md hover:border-emerald-200/80 transition"
                >
                  <div className="flex gap-3">
                    <img
                      src={m.photoUrl}
                      alt={`${m.firstName} ${m.lastName}`}
                      className="h-16 w-16 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {m.title} {m.firstName} {m.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        พรรค: {m.party}
                      </div>
                      {(m.position || m.ministry) && (
                        <div className="text-sm text-gray-600">
                          {m.position}
                          {m.position && m.ministry ? " • " : ""}
                          {m.ministry}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                    {m.workHistory}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
                      onClick={() => handleEdit(m)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      onClick={() => handleDelete(m.id)}
                    >
                      ลบ
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
