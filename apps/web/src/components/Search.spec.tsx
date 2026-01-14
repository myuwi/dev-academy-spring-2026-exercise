import { describe, it, expect, mock } from "bun:test";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "./Search";

describe("Search", () => {
  it("should render", () => {
    render(<Search value="" onChange={() => undefined} />);
    const search = screen.getByPlaceholderText("Search by date");
    expect(search).toBeInTheDocument();
  });

  it("should show value as text", async () => {
    render(<Search value="foo" onChange={(_value: string) => undefined} />);

    expect(screen.getByDisplayValue("foo")).toBeInTheDocument();
  });

  it("should update text on user events", async () => {
    const user = userEvent.setup();

    render(<Search value="foo" onChange={(_value: string) => undefined} />);

    const input = screen.getByPlaceholderText("Search by date");
    await user.type(input, " bar");

    expect(screen.getByDisplayValue("foo bar")).toBeInTheDocument();
  });

  it("should only call onChange on Enter press", async () => {
    const user = userEvent.setup();
    const handleChange = mock((_value: string) => undefined);

    render(<Search value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by date");
    await user.type(input, "foo");

    expect(handleChange).toHaveBeenCalledTimes(0);

    await user.type(input, "{enter}");

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("foo");
  });

  it("should show clear button only when input has text", async () => {
    const user = userEvent.setup();
    const handleChange = mock((_value: string) => undefined);

    render(<Search value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by date");

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    await user.type(input, "foo");

    expect(screen.getByDisplayValue("foo")).toBeInTheDocument();
    expect(screen.getByLabelText("Clear Button")).toBeInTheDocument();

    await user.type(input, "{backspace}{backspace}{backspace}");
    expect(screen.getByDisplayValue("")).toBeInTheDocument();

    expect(screen.queryByLabelText("Clear Button")).not.toBeInTheDocument();
  });

  it("should clear the input when clear button is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = mock((_value: string) => undefined);

    render(<Search value="foo" onChange={handleChange} />);

    const clearButton = screen.getByLabelText("Clear Button");
    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("");
    expect(screen.getByDisplayValue("")).toBeInTheDocument();
  });
});
