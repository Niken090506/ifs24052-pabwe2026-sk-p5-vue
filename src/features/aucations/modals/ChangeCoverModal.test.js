import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockAucation = {
    id: 1,
    title: "Item Lelang",
    cover: "https://example.com/cover.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal with existing preview and close properly", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const preview = wrapper.find('[data-testid="cover-preview-img"]');
    expect(preview.exists()).toBe(true);
    expect(preview.attributes("src")).toBe("https://example.com/cover.jpg");

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-cover-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });

  it("should validate file change inputs", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: { id: 2, cover: null },
      },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');

    // Case 1: Trigger change without selecting file
    await fileInput.trigger("change");

    // Case 2: Invalid file type
    const textFile = new File(["dummy"], "file.txt", { type: "text/plain" });
    Object.defineProperty(fileInput.element, "files", {
      value: [textFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Format file harus berupa gambar!");

    // Case 3: File too large (>2MB)
    const largeFile = new File([new Uint8Array(3 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput.element, "files", {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file cover maksimal 2MB!");

    // Case 4: Valid image file
    const validFile = new File(["valid"], "image.png", { type: "image/png" });
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/image.png");
    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(wrapper.find('[data-testid="cover-preview-img"]').exists()).toBe(true);
  });

  it("should show error dialog when save triggered without file", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih file gambar cover!");
  });

  it("should dispatch asyncSetIsAucationChangeCover and close on success", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    const changeCoverSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationChangeCover")
      .mockResolvedValue();

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validFile = new File(["image data"], "cover.jpg", { type: "image/jpeg" });
    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeCoverSpy).toHaveBeenCalledWith(1, validFile);

    aucationsStore.setIsAucationChangedCover(true);
    aucationsStore.setIsAucationChangeCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle isAucationChangeCover true when isAucationChangedCover is false", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: mockAucation,
      },
    });

    aucationsStore.setIsAucationChangedCover(false);
    aucationsStore.setIsAucationChangeCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should handle aucation without id when isAucationChangedCover is true", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        aucation: {},
      },
    });

    const fetchDetailSpy = vi.spyOn(aucationsStore, "asyncSetAucation");
    aucationsStore.setIsAucationChangedCover(true);
    aucationsStore.setIsAucationChangeCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchDetailSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
