import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeModal", () => {
  const mockAucation = {
    id: 1,
    title: "Jam Tangan Rolex",
    start_bid: 10000000,
    closed_at: "2026-12-31 23:59:59",
    description: "Kondisi mulus lengkap kotak dan sertifikat.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should populate inputs with aucation data and handle close/cancel", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const titleInput = wrapper.find('[data-testid="edit-aucation-title-input"]');
    expect(titleInput.element.value).toBe("Jam Tangan Rolex");

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });

  it("should handle empty closed_at or missing fields in aucation object", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: { id: 2, title: "", start_bid: 0, closed_at: null, description: "" },
      },
    });

    const closedAtInput = wrapper.find('[data-testid="edit-aucation-closed-at-input"]');
    expect(closedAtInput.element.value).toBe("");

    await wrapper.setProps({
      aucation: mockAucation,
    });
    expect(wrapper.find('[data-testid="edit-aucation-title-input"]').element.value).toBe("Jam Tangan Rolex");
  });

  it("should validate empty title", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const titleInput = wrapper.find('[data-testid="edit-aucation-title-input"]');
    await titleInput.setValue("   ");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should validate empty or invalid start_bid", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const startBidInput = wrapper.find('[data-testid="edit-aucation-start-bid-input"]');
    await startBidInput.setValue("0");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Harga penawaran awal harus lebih dari 0");
  });

  it("should validate empty closed_at", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: { ...mockAucation, closed_at: null },
      },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Batas waktu penutupan lelang harus diisi");
  });

  it("should validate empty description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const textarea = wrapper.find('textarea[data-testid="edit-aucation-description-input"]');
    await textarea.setValue("   ");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsAucationChange and close on success", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const changeSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationChange")
      .mockResolvedValue();

    const titleInput = wrapper.find('[data-testid="edit-aucation-title-input"]');
    await titleInput.setValue("Rolex Submariner Original");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(
      1,
      "Rolex Submariner Original",
      "Kondisi mulus lengkap kotak dan sertifikat.",
      10000000,
      "2026-12-31 23:59:00"
    );

    aucationsStore.setIsAucationChanged(true);
    aucationsStore.setIsAucationChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle closedAt with length not 16", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, aucation: mockAucation },
    });

    const changeSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationChange")
      .mockResolvedValue();

    await wrapper.find('[data-testid="edit-aucation-title-input"]').setValue("Updated title");
    await wrapper.find('[data-testid="edit-aucation-start-bid-input"]').setValue("2000000");
    await wrapper.find('[data-testid="edit-aucation-closed-at-input"]').setValue("2026-12-31 23:59:59");
    await wrapper.find('textarea[data-testid="edit-aucation-description-input"]').setValue("Updated description");

    await wrapper.find("form").trigger("submit");
    expect(changeSpy).toHaveBeenCalledWith(
      1,
      "Updated title",
      "Updated description",
      2000000,
      "2026-12-31 23:59:59"
    );
  });

  it("should handle aucation without id when isAucationChanged is true", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: {},
      },
    });

    const fetchDetailSpy = vi.spyOn(aucationsStore, "asyncSetAucation");
    aucationsStore.setIsAucationChanged(true);
    aucationsStore.setIsAucationChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchDetailSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle isAucationChange true when isAucationChanged is false", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    aucationsStore.setIsAucationChanged(false);
    aucationsStore.setIsAucationChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-aucation-modal"]').exists()).toBe(true);
  });

  it("should toggle body overflow when show prop changes", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, aucation: mockAucation },
    });

    expect(document.body.style.overflow).toBe("auto");

    await wrapper.setProps({ show: true });
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("auto");
  });
});
