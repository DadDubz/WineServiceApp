import AddTableForm from "../components/AddTableForm";
import AddCourseForm from "../components/AddCourseForm";

// Add any necessary state or logic here, or remove this placeholder

<AddTableForm onAdd={(newTable) => setTables([...tables, newTable])} />

// Add any necessary state or logic here, or remove this placeholder

{tables.map(t => (
  <div key={t.id} className="...">
    ...
    <AddCourseForm tableId={t.id} onAdd={(newCourse) => {
      setTables(tables.map(tb =>
        tb.id === t.id ? { ...tb, courses: [...tb.courses, newCourse] } : tb
      ));
    }} />
  </div>
))}
