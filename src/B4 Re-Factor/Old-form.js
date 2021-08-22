import React, { useState } from "react";
import { TextField, Button, Select, InputLabel } from "@material-ui/core";

export const Form = () => {
  const [isSaving, setIsSaving] = useState(false);

  const [formErrors, setFormErrors] = useState({
    name: "",
    size: "",
    type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    // elements son todos los nodos hijos
    // para poder extraer elementos, deben de tener un id con ese nombre
    const { name, size, type } = e.target.elements;

    // nodo.value para acceder al valor asignado
    if (!name.value) {
      // se crea una arrow func, para forzar que se actualize el valor
      // ya que React no permite actualizar una variable de manera repetida
      setFormErrors((prevState) => ({
        ...prevState,
        name: "The name is required",
      }));
    }
    if (!size.value) {
      setFormErrors((prevState) => ({
        ...prevState,
        size: "The size is required",
      }));
    }
    if (!type.value) {
      setFormErrors((prevState) => ({
        ...prevState,
        type: "The type is required",
      }));
    }

    // fetch async
    await fetch("/products", {
      method: "POST",
      body: JSON.stringify({}),
    });

    setIsSaving(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setFormErrors({
      ...formErrors,
      [name]: value.length ? "" : `The ${name} is required`,
    });
  };

  return (
    <>
      <h1>Create Product</h1>

      <form onSubmit={handleSubmit}>
        <TextField
          label="name"
          id="name"
          name="name"
          helperText={formErrors.name}
          onBlur={handleBlur}
        />
        <TextField
          label="size"
          id="size"
          name="size"
          helperText={formErrors.size}
          onBlur={handleBlur}
        />
        <InputLabel htmlFor="type">Type</InputLabel>
        <Select
          native
          value=""
          inputProps={{
            name: "type",
            id: "type",
          }}
        >
          <option aria-label="None" value="" />
          <option value="Electronic">Electronic</option>
          <option value="Furniture">Furniture</option>
          <option value="Clothing">Clothing</option>
        </Select>

        {formErrors.type.length && <p>{formErrors.type}</p>}

        <Button disabled={isSaving} type="submit">
          Submit
        </Button>
      </form>
    </>
  );
};
