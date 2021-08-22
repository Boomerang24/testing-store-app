import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  InputLabel,
  Typography,
} from "@material-ui/core";
import { Container, CssBaseline, Grid } from "@material-ui/core";

import { saveProduct } from "../services/productServices";
import {
  CREATED_STATUS,
  ERROR_SERVER_STATUS,
  INVALID_REQUEST_STATUS,
} from "../consts/httpStatus";

export const Form = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSucessful, setIsSucessful] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    size: "",
    type: "",
  });

  const validateField = ({ name, value }) => {
    setFormErrors((prevState) => ({
      ...prevState,
      [name]: value.length ? "" : `The ${name} is required`,
    }));
  };

  const validateForm = ({ name, size, type }) => {
    validateField({ name: "name", value: name });
    validateField({ name: "size", value: size });
    validateField({ name: "type", value: type });
  };

  const getFormValues = ({ name, size, type }) => ({
    name: name.value,
    size: size.value,
    type: type.value,
  });

  const handleFetchErrors = async (err) => {
    if (err.status === ERROR_SERVER_STATUS) {
      setErrorMessage("Unexpected error, please try again");
      return;
    }

    if (err.status === INVALID_REQUEST_STATUS) {
      const data = await err.json();
      setErrorMessage(data.message);
      return;
    }

    setErrorMessage("Connection error, please try later");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    // elements son todos los nodos hijos
    // para poder extraer elementos, deben de tener un id con ese nombre
    const { name, size, type } = e.target.elements;

    validateForm(getFormValues({ name, size, type }));

    try {
      const response = await saveProduct(getFormValues({ name, size, type }));

      if (!response.ok) {
        throw response;
      }

      if (response.status === CREATED_STATUS) {
        //Formulario se limpia
        e.target.reset();
        setIsSucessful(true);
      }
    } catch (err) {
      handleFetchErrors(err);
    }

    setIsSaving(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    validateField({ name, value });
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />

      <Typography component="h1" variant="h5" align="center">
        Create Product
      </Typography>

      {isSucessful && <p>Product Stored</p>}
      <p>{errorMessage}</p>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="name"
              id="name"
              name="name"
              helperText={formErrors.name}
              onBlur={handleBlur}
              error={!!formErrors.name.length}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="size"
              id="size"
              name="size"
              helperText={formErrors.size}
              onBlur={handleBlur}
              error={!!formErrors.size.length}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel htmlFor="type">Type</InputLabel>
            <Select
              native
              fullWidth
              error={!!formErrors.type.length}
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

            {/* {formErrors.type.length > 0 && <p>{formErrors.type}</p>} */}
            {!!formErrors.type.length && <p>{formErrors.type}</p>}
          </Grid>

          <Grid item xs={12}>
            <Button fullWidth disabled={isSaving} type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};
