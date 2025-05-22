import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import District from "../pages/locations/district";
import {
  getRDistrict,
  getRegions,
  postLocationDistrict,
  updateDistrict,
} from "../helpers/api-helper";
import authReducer from "../store/slices/auth-slice";

type UserStatus = "ACTIVE" | "INACTIVE";
type UserRole = "ADMIN" | "USER";

// Mock hasPointerCapture for JSDOM environment
beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  // Mock scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();
});

// Mock the API helper
jest.mock("../helpers/api-helper", () => ({
  getRDistrict: jest.fn(),
  getRegions: jest.fn(),
  postLocationDistrict: jest.fn(),
  updateDistrict: jest.fn(),
}));

// Create a new QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      user: authReducer,
    },
    preloadedState: {
      user: {
        isAuthenticated: true,
        accessToken: "mock-token",
        userInfo: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          status: "ACTIVE" as UserStatus,
          role: "ADMIN" as UserRole,
          createdAt: "2024-01-01",
        },
        error: "",
        success: true,
      },
    },
  });
};

// Mock data for testing
const mockDistricts = {
  data: [
    { id: "1", name: "Kigamboni", region: "1", regionName: "Dar es Salaam" },
    { id: "2", name: "Bagamoyo", region: "1", regionName: "Dar es Salaam" },
    { id: "3", name: "Ilala", region: "1", regionName: "Dar es Salaam" },
  ],
};

const mockRegions = {
  data: [
    { id: "1", name: "Dar es Salaam" },
    { id: "2", name: "Arusha" },
    { id: "3", name: "Mwanza" },
  ],
};

// Wrapper component to provide all required providers
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore();

  return (
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe("Districts Page", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    queryClient.clear();
  });

  test("renders loading state initially", async () => {
    // Mock the API to return empty data instead of undefined
    (getRDistrict as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    expect(screen.getByText("Districts")).toBeInTheDocument();
    expect(
      screen.getByText("Here's a list of your districts")
    ).toBeInTheDocument();
    expect(screen.getByText("Loading .....")).toBeInTheDocument();
  });

  test("renders districts data after loading", async () => {
    // Mock the getRDistrict API call
    (getRDistrict as jest.Mock).mockResolvedValue(mockDistricts);

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText("Loading .....")).not.toBeInTheDocument();
    });

    // Check if all districts are displayed
    expect(screen.getByText("Kigamboni")).toBeInTheDocument();
    expect(screen.getByText("Bagamoyo")).toBeInTheDocument();
    expect(screen.getByText("Ilala")).toBeInTheDocument();

    // Check if region names are displayed
    expect(screen.getAllByText("Dar es Salaam")).toHaveLength(3);
  });

  test("displays no results message when data is empty", async () => {
    // Mock empty data response
    (getRDistrict as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    // Mock API error
    (getRDistrict as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading .....")).not.toBeInTheDocument();
    });

    // Check if error state is handled
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("add new district button is present when data is loaded", async () => {
    // Mock the getRDistrict API call to return data
    (getRDistrict as jest.Mock).mockResolvedValue(mockDistricts);

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    // Wait for data to load and verify initial data is present
    await waitFor(() => {
      expect(screen.getByText("Kigamboni")).toBeInTheDocument();
    });

    // Check if add button exists
    const addButton = screen.getByRole("button", { name: /add district/i });
    expect(addButton).toBeInTheDocument();
  });

  test("can create a new district", async () => {
    // ✅ Mock initial district list
    (getRDistrict as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Ilala",
          region: "1",
          regionName: "Dar es Salaam",
        },
      ],
    });

    // ✅ Mock regions used in the form dropdown
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: "1", name: "Dar es Salaam" },
        { id: "2", name: "Arusha" },
      ],
    });

    // ✅ Mock POST API call for district creation
    const mockPostDistrict = jest.fn().mockResolvedValue({
      data: {
        id: "2",
        name: "Kinondoni",
        region: "1",
        regionName: "Dar es Salaam",
      },
    });
    (postLocationDistrict as jest.Mock).mockImplementation(mockPostDistrict);

    // ✅ Render the component
    await act(async () => {
      render(
        <Wrapper>
          <District />
        </Wrapper>
      );
    });

    // Wait for existing district to be visible
    await waitFor(() => {
      expect(screen.getByText("Ilala")).toBeInTheDocument();
    });

    // Click "Add District" button
    const addButton = screen.getByRole("button", { name: /add district/i });
    await userEvent.click(addButton);

    // Wait for modal to open and form fields to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Fill in district name
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, "Kinondoni");

    // Open region dropdown
    const regionSelect = screen.getByRole("combobox");
    await userEvent.click(regionSelect);

    // Select "Dar es Salaam" from dropdown
    const regionOption = await screen.findByRole("option", {
      name: /Dar es Salaam/i,
    });
    expect(regionOption).toBeVisible();
    await userEvent.click(regionOption);

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create district/i,
    });
    await userEvent.click(submitButton);

    // Verify POST API was called correctly
    expect(mockPostDistrict).toHaveBeenCalledWith({
      name: "Kinondoni",
      region: "1",
    });

    // Ensure modal is closed after submission
    await waitFor(() => {
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });
  });

  test("can edit an existing district", async () => {
    // Mock initial data
    (getRDistrict as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Kigamboni",
          region: "1",
          regionName: "Dar es Salaam",
        },
      ],
    });

    // Mock regions data for the form
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: "1", name: "Dar es Salaam" },
        { id: "2", name: "Arusha" },
        { id: "3", name: "Mwanza" },
      ],
    });

    // Mock the update request
    const mockUpdateDistrict = jest.fn().mockResolvedValue({
      data: {
        id: "1",
        name: "Updated District",
        region: "1",
        regionName: "Dar es Salaam",
      },
    });
    (updateDistrict as jest.Mock) = mockUpdateDistrict;

    render(
      <Wrapper>
        <District />
      </Wrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("Kigamboni")).toBeInTheDocument();
    });

    // Open the menu first
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    await userEvent.click(menuButton);

    // Now find and click the edit button
    const editButton = screen.getByRole("menuitem", { name: /edit/i });
    await userEvent.click(editButton);

    // Verify the form is pre-filled with existing data
    const nameInput = screen.getByLabelText(/district name/i);
    expect(nameInput).toHaveValue("Kigamboni");

    // Update the name
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated District");

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /update district/i,
    });
    await userEvent.click(submitButton);

    // Verify the API was called with correct data
    expect(mockUpdateDistrict).toHaveBeenCalledWith("1", {
      name: "Updated District",
      region: "1",
    });

    // Verify the dialog is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/district name/i)).not.toBeInTheDocument();
    });
  });
});
