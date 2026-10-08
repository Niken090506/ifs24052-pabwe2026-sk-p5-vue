import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal form when show is true and emit close on cancel/close button", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-add-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });

  it("should show validation error if title is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should show validation error if startBid is invalid or <= 0", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-aucation-title-input"]');
    await titleInput.setValue("Valid Title");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Harga penawaran awal harus lebih dari 0");

    const startBidInput = wrapper.find('[data-testid="add-aucation-start-bid-input"]');
    await startBidInput.setValue("0");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Harga penawaran awal harus lebih dari 0");
  });

  it("should show validation error if closedAt is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-aucation-title-input"]');
    const startBidInput = wrapper.find('[data-testid="add-aucation-start-bid-input"]');

    await titleInput.setValue("Valid Title");
    await startBidInput.setValue("100000");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Batas waktu penutupan lelang harus diisi");
  });

  it("should show validation error if description is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-aucation-title-input"]');
    const startBidInput = wrapper.find('[data-testid="add-aucation-start-bid-input"]');
    const closedAtInput = wrapper.find('[data-testid="add-aucation-closed-at-input"]');

    await titleInput.setValue("Valid Title");
    await startBidInput.setValue("100000");
    await closedAtInput.setValue("2026-12-31T23:59");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsAucationAdd and call onClose on successful add", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const addSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationAdd")
      .mockResolvedValue();

    const titleInput = wrapper.find('[data-testid="add-aucation-title-input"]');
    const startBidInput = wrapper.find('[data-testid="add-aucation-start-bid-input"]');
    const closedAtInput = wrapper.find('[data-testid="add-aucation-closed-at-input"]');
    const textarea = wrapper.find('textarea[data-testid="add-aucation-description-input"]');

    await titleInput.setValue("Camera Sony");
    await startBidInput.setValue("5000000");
    await closedAtInput.setValue("2026-12-31T23:59");
    await textarea.setValue("Deskripsi markdown");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(
      "Camera Sony",
      "Deskripsi markdown",
      5000000,
      "2026-12-31 23:59:00"
    );

    // Simulate success from store
    aucationsStore.setIsAucationAdded(true);
    aucationsStore.setIsAucationAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle closedAt with length not 16", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const addSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationAdd")
      .mockResolvedValue();

    await wrapper.find('[data-testid="add-aucation-title-input"]').setValue("Camera Sony");
    await wrapper.find('[data-testid="add-aucation-start-bid-input"]').setValue("5000000");
    await wrapper.find('[data-testid="add-aucation-closed-at-input"]').setValue("2026-12-31 23:59:59");
    await wrapper.find('textarea[data-testid="add-aucation-description-input"]').setValue("Deskripsi");

    await wrapper.find("form").trigger("submit");
    expect(addSpy).toHaveBeenCalledWith("Camera Sony", "Deskripsi", 5000000, "2026-12-31 23:59:59");
  });

  it("should handle isAucationAdd true when isAucationAdded is false", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    aucationsStore.setIsAucationAdded(false);
    aucationsStore.setIsAucationAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="add-aucation-modal"]').exists()).toBe(true);
  });

  it("should change document body overflow when show prop changes", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: false },
    });

    expect(document.body.style.overflow).toBe("auto");

    await wrapper.setProps({ show: true });
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("auto");
  });
});
