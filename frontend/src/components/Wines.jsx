import AddWineForm from "../components/AddWineForm";

...

<AddWineForm onAdd={(newWine) => setWines([...wines, newWine])} />
