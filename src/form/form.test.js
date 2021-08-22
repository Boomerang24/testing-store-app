import React from "react";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import {
  CREATED_STATUS,
  ERROR_SERVER_STATUS,
  INVALID_REQUEST_STATUS,
} from "../consts/httpStatus";

import { Form } from "./form";

const server = setupServer(
  rest.post("/products", (req, res, ctx) => {
    const { name, size, type } = req.body;

    if (name && size && type) {
      return res(ctx.status(CREATED_STATUS));
    }

    return res(ctx.status(ERROR_SERVER_STATUS));
  })
);

// Server se inicializa
beforeAll(() => server.listen());
// Server se cierra
afterAll(() => server.close());

beforeEach(() => render(<Form />));

afterEach(() => server.resetHandlers());

describe("when the form is mounted", () => {
  it("there must be a create product form page", () => {
    expect(
      screen.getByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();
  });

  it("fields should exist: name, size, type", () => {
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();

    expect(screen.queryByText(/electronic/i)).toBeInTheDocument();
    expect(screen.queryByText(/furniture/i)).toBeInTheDocument();
    expect(screen.queryByText(/clothing/i)).toBeInTheDocument();
  });

  it("submit button should exist", () => {
    // Ejemplo como obtener Submit
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});

describe("when user submits the form without values", () => {
  it("should display validation warnings", async () => {
    expect(screen.queryByText(/The name is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/The size is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/The type is required/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.queryByText(/The name is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/The size is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/The type is required/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled()
    );
  });
});

describe("when a user blurs an empty field", () => {
  it("should display a validation error message for the input name", () => {
    expect(screen.queryByText(/the name is required/i)).not.toBeInTheDocument();

    fireEvent.blur(screen.getByLabelText(/name/i), {
      target: { name: "name", value: "" },
    });

    expect(screen.queryByText(/the name is required/i)).toBeInTheDocument();
  });
  it("should display a validation error message for the size name", () => {
    expect(screen.queryByText(/the name is required/i)).not.toBeInTheDocument();

    fireEvent.blur(screen.getByLabelText(/size/i), {
      target: { name: "size", value: "" },
    });

    expect(screen.queryByText(/the size is required/i)).toBeInTheDocument();
  });
});

describe("when the user submits the form properly and servers returns created status", () => {
  it("submit button should be disabled until the request is done", async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    // --wait and expect not to be disabled--

    // waitFor() retorna una promesa
    await waitFor(() => expect(submitBtn).toBeDisabled());
  });

  it('the form page should display the success message "Product stored and clean fields', async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    const nameInput = screen.getByLabelText(/name/i);
    const sizeInput = screen.getByLabelText(/size/i);
    const typeSelect = screen.getByLabelText(/type/i);

    fireEvent.change(nameInput, {
      target: { name: "name", value: "my product" },
    });
    fireEvent.change(sizeInput, {
      target: { name: "name", value: "10" },
    });
    fireEvent.change(typeSelect, {
      target: { name: "name", value: "Electronic" },
    });

    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/product stored/i)).toBeInTheDocument()
    );

    expect(nameInput).toHaveValue("");
    expect(sizeInput).toHaveValue("");
    expect(typeSelect).toHaveValue("");
  });
});

describe("when user submits the form and server returns unexpected error", () => {
  it('the form page must display "Unexpected error, please try again"', async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(
        screen.getByText(/Unexpected error, please try again/i)
      ).toBeInTheDocument()
    );
  });
});

describe("when user submits the form and server returns an invalid request error", () => {
  it('the form page must display "The form is invalid, the fields [field1...fieldN] are required"', async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    server.use(
      rest.post("/products", (req, res, ctx) => {
        return res(
          ctx.status(INVALID_REQUEST_STATUS),
          ctx.json({
            message:
              "The form is invalid, the fields name, size, type are required",
          })
        );
      })
    );

    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(
        screen.getByText(
          /the form is invalid, the fields name, size, type are required/i
        )
      ).toBeInTheDocument()
    );
  });
});

describe("when user submits the form and server returns connection error", () => {
  it('the form page must display "The form is invalid, the fields [field1...fieldN] are required"', async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    server.use(
      rest.post("/products", (req, res) =>
        res.networkError("Failed to connect")
      )
    );

    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(
        screen.getByText(/connection error, please try later/i)
      ).toBeInTheDocument()
    );
  });
});
