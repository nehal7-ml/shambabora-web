import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Region from "../pages/locations/region";
import { getRegions, postLocationRegion, updateRegion } from "../helpers/api-helper";
import authReducer from "../store/slices/auth-slice";

type UserStatus = "ACTIVE" | "INACTIVE";
type UserRole = "ADMIN" | "USER";

// Mock the API helper
jest.mock("../helpers/api-helper", () => ({
  getRegions: jest.fn(),
  postLocationRegion: jest.fn(),
  updateRegion: jest.fn(),
}));

// Create a new QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

describe("Regions Page", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    expect(screen.getByText("Regions")).toBeInTheDocument();
    expect(screen.getByText("Here's a list of your regions")).toBeInTheDocument();
    expect(screen.getByText("Loading .....")).toBeInTheDocument();
  });

  test("renders regions data after loading", async () => {
    // Mock the getRegions API call
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Dar es Salaam' },
        { id: '2', name: 'Arusha' },
        { id: '3', name: 'Mwanza' }
      ]
    });

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText("Loading .....")).not.toBeInTheDocument();
    });

    // Check if all regions are displayed
    expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
    expect(screen.getByText("Arusha")).toBeInTheDocument();
    expect(screen.getByText("Mwanza")).toBeInTheDocument();
  });

  test("displays no results message when data is empty", async () => {
    // Mock empty data response
    (getRegions as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    // Mock API error
    (getRegions as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading .....")).not.toBeInTheDocument();
    });

    // Check if error state is handled
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("add new region button is present when data is loaded", async () => {
    // Mock the getRegions API call to return data
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Dar es Salaam' },
        { id: '2', name: 'Arusha' },
        { id: '3', name: 'Mwanza' }
      ]
    });

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    // Wait for data to load and verify initial data is present
    await waitFor(() => {
      expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
    });

    // Check if add button exists
    const addButton = screen.getByRole('button', { name: /add region/i });
    expect(addButton).toBeInTheDocument();
  });

  test("can create a new region", async () => {
    // Mock initial data
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Dar es Salaam' }
      ]
    });

    // Mock the post request
    const mockPostRegion = jest.fn().mockResolvedValue({
      data: { id: '2', name: 'New Region' }
    });
    (postLocationRegion as jest.Mock) = mockPostRegion;

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
    });

    // Click add button
    const addButton = screen.getByRole('button', { name: /add region/i });
    await userEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText(/region name/i);
    await userEvent.type(nameInput, 'New Region');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create region/i });
    await userEvent.click(submitButton);

    // Verify the API was called with correct data
    expect(mockPostRegion).toHaveBeenCalledWith({
      name: 'New Region',
      post_code: expect.any(String) // Since this is generated randomly
    });

    // Verify the dialog is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/region name/i)).not.toBeInTheDocument();
    });
  });

  test("can edit an existing region", async () => {
    // Mock initial data
    (getRegions as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Dar es Salaam' }
      ]
    });

    // Mock the update request
    const mockUpdateRegion = jest.fn().mockResolvedValue({
      data: { id: '1', name: 'Updated Region' }
    });
    (updateRegion as jest.Mock) = mockUpdateRegion;

    render(
      <Wrapper>
        <Region />
      </Wrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
    });

    // Open the menu first
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    await userEvent.click(menuButton);

    // Now find and click the edit button
    const editButton = screen.getByRole('menuitem', { name: /edit/i });
    await userEvent.click(editButton);

    // Verify the form is pre-filled with existing data
    const nameInput = screen.getByLabelText(/region name/i);
    expect(nameInput).toHaveValue('Dar es Salaam');

    // Update the name
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Region');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /update region/i });
    await userEvent.click(submitButton);

    // Verify the API was called with correct data
    expect(mockUpdateRegion).toHaveBeenCalledWith('1', {
      name: 'Updated Region'
    });

    // Verify the dialog is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/region name/i)).not.toBeInTheDocument();
    });
  });
});
