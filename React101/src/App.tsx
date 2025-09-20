import "./App.css";
import { useState } from "react";
import HouseMembers from "./components/HouseMembers";
import SiteHeader from "./components/SiteHeader";

function App() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("A");
  const [subjects, setSubjects] = useState<{ name: string; grade: string }[]>(
    []
  );

  // GPA calculation state (only updates when clicking Calculate)
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState({ counted: 0, totalPoints: 0, gpa: 0 });

  const gradeOption = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W"];
  const gradeRender = gradeOption.map((g) => (
    <option className="text-black" key={g} value={g}>
      {g}
    </option>
  ));

  const addSubject = () => {
    if (!name.trim()) return;
    setSubjects([...subjects, { name, grade }]);
    setName("");
    setGrade("A");
    setHasCalculated(false);
  };

  const deleteSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
    setHasCalculated(false);
  };

  // === GPA section ===
  // Mapping เกรด -> คะแนน (ตัด W ออกจากการคำนวณ)
  const gradePoint: Record<string, number | null> = {
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    "D+": 1.5,
    D: 1.0,
    F: 0.0,
    W: null, // ไม่คิดเกรดเฉลี่ย
  };

  // คำนวณ GPA ด้วย useMemo เพื่อไม่ให้คำนวณใหม่ทุกครั้งโดยไม่จำเป็น
  const calculateGPA = () => {
    const countedSubjects = subjects.filter(
      (s) => gradePoint[s.grade] !== null
    );
    const total = countedSubjects.reduce(
      (sum, s) => sum + (gradePoint[s.grade] ?? 0),
      0
    );
    const gpaVal =
      countedSubjects.length > 0 ? total / countedSubjects.length : 0;
    setResult({
      counted: countedSubjects.length,
      totalPoints: total,
      gpa: gpaVal,
    });
    setHasCalculated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 shadow-sm my-12">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <HouseMembers />
        <div className="my-10 h-px bg-gray-200" />
        <h1 className="text-3xl font-bold mb-6 text-center">Subject & Grade</h1>

        <div className="space-y-4 mb-6">
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ชื่อวิชา"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            {gradeRender}
          </select>
          <button
            onClick={addSubject}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            เพิ่มวิชา
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">รายวิชา</h2>
        <ul className="space-y-2 mb-6">
          {subjects.map((subj, index) => (
            <li
              key={index}
              className="flex items-center justify-between px-3 py-2 rounded-md border"
              style={{ color: subj.grade === "F" ? "red" : "black" }}
            >
              <span>
                {subj.name} : {subj.grade}
              </span>
              <button
                onClick={() => deleteSubject(index)}
                className="deletebtn text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                ลบ
              </button>
            </li>
          ))}
          {subjects.length === 0 && (
            <li className="text-gray-500">ยังไม่มีรายวิชา</li>
          )}
        </ul>

        <div className="mb-6">
          <button
            onClick={calculateGPA}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            คำนวณ GPA
          </button>
        </div>

        {/* GPA Summary Card */}
        <div className="rounded-xl border p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">เกรดเฉลี่ย (GPA)</h3>
          <p className="text-sm text-gray-600 mb-1">
            นับเฉพาะวิชาที่ได้เกรด A–F (ไม่นับ W)
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border">
              <div className="text-xs text-gray-600">วิชาที่นับรวม</div>
              <div className="text-xl font-bold">
                {hasCalculated ? result.counted : "-"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border">
              <div className="text-xs text-gray-600">คะแนนรวม</div>
              <div className="text-xl font-bold">
                {hasCalculated ? result.totalPoints.toFixed(2) : "-"}
              </div>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-gray-100 border text-center">
              <div className="text-xs text-gray-600">GPA</div>
              <div
                className={`text-3xl font-extrabold ${
                  !hasCalculated || result.counted === 0
                    ? "text-gray-400"
                    : result.gpa >= 3.2
                    ? "text-green-600"
                    : result.gpa >= 2
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {!hasCalculated || result.counted === 0
                  ? "-"
                  : result.gpa.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
