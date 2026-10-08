import { describe, it, expect, vi, beforeEach } from "vitest";
import BidModal from "./BidModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("BidModal", () => {
  const mockAucationWithBids = {
    id: 1,
    title: "Vespa Klasik 1978",
    start_bid: 15000000,
    bids: [
      { id: 1, bid: 16000000 },
      { id: 2, bid: 18000000 },
    ],
  };

  const mockAucationWithoutBids = {
    id: 2,
    title: "MacBook Air M2",
    start_bid: 12000000,
    bids: [],
  };

  const mockAucationWithRawBids = {
    id: 3,
    title: "iPhone 15",
    start_bid: 10000000,
    bids: [11000000, 12500000],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render item info and highest bid correctly", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids,
      },
    });

    expect(wrapper.text()).toContain("Vespa Klasik 1978");
    expect(wrapper.text()).toContain("18.000.000");

    const closeBtn = wrapper.find('[data-testid="close-bid-modal-btn"]');
    closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-bid-modal-btn"]');
    cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });

  it("should calculate minBid from raw bid array and from empty bids", () => {
    const { wrapper: wrapperRaw } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithRawBids,
      },
    });
    expect(wrapperRaw.text()).toContain("12.500.000");

    const { wrapper: wrapperEmpty } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithoutBids,
      },
    });
    expect(wrapperEmpty.text()).toContain("12.000.000");
  });

  it("should validate invalid or zero bid amount", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids,
      },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nominal tawaran harus berupa angka lebih dari 0!");

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("-500");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nominal tawaran harus berupa angka lebih dari 0!");
  });

  it("should validate bid lower than minBid", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids, // highest is 18000000, minBid is 18000001
      },
    });

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("17000000");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsBidAdd and close on success", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids,
      },
    });

    const addBidSpy = vi
      .spyOn(aucationsStore, "asyncSetIsBidAdd")
      .mockResolvedValue();

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("20000000");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addBidSpy).toHaveBeenCalledWith(1, 20000000);

    aucationsStore.setIsBidAdded(true);
    aucationsStore.setIsBidAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle isBidAdd true when isBidAdded is false", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids,
      },
    });

    aucationsStore.setIsBidAdded(false);
    aucationsStore.setIsBidAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true);
  });

  it("should handle aucation without id when isBidAdded is true", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: {},
      },
    });

    const fetchDetailSpy = vi.spyOn(aucationsStore, "asyncSetAucation");
    aucationsStore.setIsBidAdded(true);
    aucationsStore.setIsBidAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchDetailSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle null aucation", () => {
    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: null,
      },
    });

    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);
    expect(wrapper.vm.currentHighestBid).toBe(0);
    expect(wrapper.vm.minBid).toBe(1);
  });

  it("should validate non-numeric bid value", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(BidModal, {
      props: {
        show: true,
        aucation: mockAucationWithBids,
      },
    });

    const input = wrapper.find('[data-testid="bid-amount-input"]');
    await input.setValue("abc");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Nominal tawaran harus berupa angka lebih dari 0!");
  });
});
