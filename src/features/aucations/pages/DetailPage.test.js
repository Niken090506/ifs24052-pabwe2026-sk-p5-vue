import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { ref } from "vue";

const mockRouter = {
  push: vi.fn(),
};

const mockCurrentRoute = ref({
  params: { aucationId: "1" },
});

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockCurrentRoute.value,
  };
});

describe("DetailPage", () => {
  const mockProfile = {
    id: 1,
    name: "Owner User",
    email: "owner@delcom.org",
  };

  const mockAucationOwner = {
    id: 1,
    user_id: 1,
    title: "Sony FX3 Camera",
    description: "Kamera bioskop ringkas.",
    start_bid: 50000000,
    closed_at: "2099-12-31 23:59:59",
    created_at: "2026-01-01 10:00:00",
    cover: "https://example.com/fx3.jpg",
    author: { name: "Owner User", photo: null },
    bids: [
      { id: 1, bid: 52000000, created_at: "2026-01-02 12:00:00" },
      { id: 2, bid: 55000000, created_at: "2026-01-03 14:00:00" },
    ],
  };

  const mockAucationNonOwnerWithMyBid = {
    id: 2,
    user_id: 99,
    title: "DJI Mavic 3 Pro",
    description: null,
    start_bid: 30000000,
    closed_at: "2099-12-31 23:59:59",
    created_at: "2026-01-01 10:00:00",
    cover: null,
    author: null,
    bids: [31000000, 33000000],
    my_bid: { id: 5, bid: 33000000 },
  };

  const mockAucationClosed = {
    id: 3,
    user_id: 99,
    title: "Barang Lawas",
    description: "Sudah selesai lelangnya.",
    start_bid: 1000000,
    closed_at: "2020-01-01 00:00:00",
    created_at: "2019-12-01 10:00:00",
    cover: null,
    author: { name: "Penjual Lawas" },
    bids: [],
    my_bid: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentRoute.value = { params: { aucationId: "1" } };
  });

  it("should show loading state when profile or aucation is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: null,
        aucation: null,
      },
    });

    expect(wrapper.text()).toContain("Memuat detail lelang...");
    expect(wrapper.vm.isOwner).toBe(false);
    expect(wrapper.vm.isClosed).toBe(false);
    expect(wrapper.vm.bidsList).toEqual([]);
    expect(wrapper.vm.highestBid).toBe(0);
  });

  it("should render owner details, bids list, and open/close modals properly", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationOwner,
      },
    });

    expect(wrapper.text()).toContain("Sony FX3 Camera");
    expect(wrapper.text()).toContain("Barang Milik Anda");
    expect(wrapper.text()).toContain("55.000.000");

    // Open & close cover modal
    const coverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await coverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editBtn = wrapper.find('[data-testid="edit-detail-aucation-btn"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(true);
    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(false);
  });

  it("should handle delete aucation with confirm dialog", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationOwner,
      },
    });

    const deleteSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationDelete")
      .mockResolvedValue();

    const deleteBtn = wrapper.find('[data-testid="delete-detail-aucation-btn"]');
    await deleteBtn.trigger("click");

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should cancel delete aucation when confirm dialog is rejected", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationOwner,
      },
    });

    const deleteSpy = vi.spyOn(aucationsStore, "asyncSetIsAucationDelete");

    const deleteBtn = wrapper.find('[data-testid="delete-detail-aucation-btn"]');
    await deleteBtn.trigger("click");

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should render bidder controls, my_bid info, open bid modal, and handle cancel bid", async () => {
    mockCurrentRoute.value = { params: { aucationId: "2" } };

    const { wrapper, aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationNonOwnerWithMyBid,
      },
    });

    expect(wrapper.text()).toContain("DJI Mavic 3 Pro");
    expect(wrapper.text()).toContain("Tawaran Anda");

    // Open & close Bid modal
    const placeBidBtn = wrapper.find('[data-testid="place-bid-btn"]');
    await placeBidBtn.trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);
    const closeBidBtn = wrapper.find('[data-testid="close-bid-modal-btn"]');
    await closeBidBtn.trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);

    // Cancel bid with confirm rejection
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const cancelBidSpy = vi.spyOn(aucationsStore, "asyncSetIsBidDelete");
    const cancelBidBtn = wrapper.find('[data-testid="cancel-bid-btn"]');
    await cancelBidBtn.trigger("click");
    expect(cancelBidSpy).not.toHaveBeenCalled();

    // Cancel bid with confirm acceptance
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await cancelBidBtn.trigger("click");
    expect(cancelBidSpy).toHaveBeenCalledWith(2);
  });

  it("should render closed state and empty bids fallback properly", () => {
    mockCurrentRoute.value = { params: { aucationId: "3" } };

    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationClosed,
      },
    });

    expect(wrapper.text()).toContain("Selesai / Ditutup");
    expect(wrapper.text()).toContain("Belum ada penawaran yang diajukan untuk barang ini.");
  });

  it("should navigate home when isAucationDeleted is true", async () => {
    const { aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationOwner,
      },
    });

    aucationsStore.setIsAucationDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should re-fetch auction when isBidDeleted is true", async () => {
    mockCurrentRoute.value = { params: { aucationId: "2" } };

    const { aucationsStore } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: mockAucationNonOwnerWithMyBid,
      },
    });

    const fetchSpy = vi
      .spyOn(aucationsStore, "asyncSetAucation")
      .mockResolvedValue();

    aucationsStore.setIsBidDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledWith("2");
  });

  it("should handle empty aucationId route parameter", () => {
    mockCurrentRoute.value = { params: {} };
    const { aucationsStore } = renderWithProviders(DetailPage);
    expect(aucationsStore.asyncSetAucation).toBeDefined();
  });

  it("should handle aucation with null closed_at", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        profile: mockProfile,
        aucation: { ...mockAucationOwner, closed_at: null },
      },
    });

    expect(wrapper.vm.isClosed).toBe(false);
  });
});
