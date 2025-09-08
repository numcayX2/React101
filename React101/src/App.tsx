import "./App.css";
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("A");
  const [subjects, setSubjects] = useState<{ name: string; grade: string }[]>(
    []
  );

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
  };

  const deleteSubject = (index: number) => {
    setSubjects((prevSubjects) => prevSubjects.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Subject & Grade</h1>
      <div className="space-y-4">
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
        <button onClick={addSubject}>เพิ่มวิชา</button>
      </div>
      <h2>รายวิชา</h2>
      <ul>
        {subjects.map((subj, index) => (
          <li
            key={index}
            style={{ color: subj.grade === "F" ? "red" : "yellow" }}
          >
            {subj.name} : {subj.grade}
            <button onClick={() => deleteSubject(index)} className="deletebtn">ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
