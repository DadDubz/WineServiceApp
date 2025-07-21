import AddTableForm from "../components/AddTableForm";
import AddCourseForm from "../components/AddCourseForm";

...

<AddTableForm onAdd={(newTable) => setTables([...tables, newTable])} />

...

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
