// In-memory store — persists across requests within the same serverless instance
// No database needed

let students = [];
let nextId = 1;

export function getAll() {
  return [...students].reverse();
}

export function getById(id) {
  return students.find((s) => s.id === id);
}

export function create(data) {
  const student = { id: String(nextId++), ...data, createdAt: new Date().toISOString() };
  students.push(student);
  return student;
}

export function update(id, data) {
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...data };
  return students[idx];
}

export function remove(id) {
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const [removed] = students.splice(idx, 1);
  return removed;
}
