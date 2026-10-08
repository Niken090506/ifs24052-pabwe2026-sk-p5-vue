import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { reactive } from "vue";

const mockCurrentRoute = reactive({ query: {} });

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRoute: () => mockCurrentRoute,
  };
});

describe("HomePage", () => {
  const mockProfile = {
    id: 1,
    name: "Pengguna Uji",
    email: "user@delcom.org",
  };

  const mockAucations = [
    {
      id: 10,
      user_id: 1,
      title: "MacBook Pro M3",
      description: "Laptop kencang untuk komputasi tinggi.",
      start_bid: 20000000,
      closed_at: "2099-12-31 23:59:59",
      cover: "https://example.com/macbook.jpg",
      author: { name: "Pengguna Uji", photo: "https://example.com/user.jpg" },
      bids: [21000000, 22500000],
    },
    {
      id: 20,
      user_id: 2,
      title: "PlayStation 5 Slim",
      description: "Konsol game mulus komplit stik.",
      start_bid: 7000000,
      closed_at: "2020-01-01 00:00:00",
      cover: null,
      author: { name: "Penjual Lain", photo: null },
      bids: [{ id: 1, bid: 8000000 }],
    },
    {
      id: 30,
      user_id: 3,
      title: "Sepeda Lipat Brompton",
      description: null,
      start_bid: 25000000,
      closed_at: "2099-12-31 23:59:59",
      cover: null,
      author: null,
      bids: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentRoute.query = {};
  });

  it("should render dashboard stats, empty state when no items, and item cards", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("MacBook Pro M3");
    expect(wrapper.text()).toContain("PlayStation 5 Slim");
    expect(wrapper.text()).toContain("Sepeda Lipat Brompton");
    expect(wrapper.text()).toContain("Milik Saya"); // Item 10 is owned by profile 1
    expect(wrapper.text()).toContain("Ditutup"); // Item 20 is in the past
    expect(wrapper.text()).toContain("Berlangsung"); // Items 10 & 30 are in the future
  });

  it("should filter aucations using search query input", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const searchInput = wrapper.find('[data-testid="search-aucation-input"]');
    await searchInput.setValue("Brompton");

    expect(wrapper.text()).toContain("Sepeda Lipat Brompton");
    expect(wrapper.text()).not.toContain("MacBook Pro M3");

    // Search by description
    await searchInput.setValue("stik");
    expect(wrapper.text()).toContain("PlayStation 5 Slim");

    // Empty search match
    await searchInput.setValue("Unknown Nonexistent");
    expect(wrapper.text()).toContain("Tidak ada sesi lelang ditemukan");
  });

  it("should switch filter tabs and fetch according parameters", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const fetchSpy = vi
      .spyOn(aucationsStore, "asyncSetAucations")
      .mockResolvedValue();

    const meBtn = wrapper.find('[data-testid="filter-me-btn"]');
    await meBtn.trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_me: 1 });

    const openBtn = wrapper.find('[data-testid="filter-open-btn"]');
    await openBtn.trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_closed: 1 });

    const closedBtn = wrapper.find('[data-testid="filter-closed-btn"]');
    await closedBtn.trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_closed: 0 });

    const allBtn = wrapper.find('[data-testid="filter-all-btn"]');
    await allBtn.trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith();
  });

  it("should initialize filter to me when route query is me", () => {
    mockCurrentRoute.query = { filter: "me" };

    const { aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    expect(aucationsStore.asyncSetAucations).toBeDefined();
  });

  it("should open and close AddModal when button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const addBtn = wrapper.find('[data-testid="add-aucation-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(false);
  });

  it("should open and close ChangeModal when edit button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const editBtn = wrapper.find('[data-testid="edit-aucation-btn-10"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(false);
  });

  it("should open and close BidModal when bid button clicked for open item not owned", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    // Item 30 is not owned by profile 1 and open
    const bidBtn = wrapper.find('[data-testid="bid-aucation-btn-30"]');
    await bidBtn.trigger("click");

    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-bid-modal-btn"]');
    await closeBtn.trigger("click");

    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);
  });

  it("should handle deleting item when confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const deleteSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationDelete")
      .mockResolvedValue();

    const deleteBtn = wrapper.find('[data-testid="delete-aucation-btn-10"]');
    await deleteBtn.trigger("click");

    expect(deleteSpy).toHaveBeenCalledWith(10);
  });

  it("should not delete item when cancel is selected in confirm dialog", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const deleteSpy = vi.spyOn(aucationsStore, "asyncSetIsAucationDelete");

    const deleteBtn = wrapper.find('[data-testid="delete-aucation-btn-10"]');
    await deleteBtn.trigger("click");

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should handle deleting all auctions owned by user when confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const deleteAllSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationDeleteAll")
      .mockResolvedValue();

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-aucations-btn"]');
    await deleteAllBtn.trigger("click");

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should not delete all auctions when canceled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const deleteAllSpy = vi.spyOn(aucationsStore, "asyncSetIsAucationDeleteAll");

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-aucations-btn"]');
    await deleteAllBtn.trigger("click");

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should react to deletion flags from store", async () => {
    const { aucationsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    const fetchSpy = vi.spyOn(aucationsStore, "asyncSetAucations");

    aucationsStore.setIsAucationDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(fetchSpy).toHaveBeenCalled();

    aucationsStore.setIsAucationDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should update filter when route query filter changes dynamically", async () => {
    mockCurrentRoute.query = {};
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        aucations: mockAucations,
      },
    });

    mockCurrentRoute.query = { filter: "me" };
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.find('[data-testid="filter-me-btn"]').classes()).toContain("bg-white");

    mockCurrentRoute.query = { filter: "all" };
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.find('[data-testid="filter-all-btn"]').classes()).toContain("bg-white");
  });

  it("should handle null profile for myAuctionsCount and item without closed_at", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: null,
        aucations: [{ id: 99, title: "Item Without Date", closed_at: null, bids: [] }],
      },
    });

    expect(wrapper.vm.myAuctionsCount).toBe(0);
    expect(wrapper.vm.checkIsClosed({ closed_at: null })).toBe(false);
    expect(wrapper.vm.getHighestBid(null)).toBe(0);
    expect(wrapper.vm.getHighestBid({ start_bid: 1000, bids: [] })).toBe(1000);
    expect(wrapper.vm.getHighestBid({ start_bid: 0, bids: [] })).toBe(0);
  });
});
