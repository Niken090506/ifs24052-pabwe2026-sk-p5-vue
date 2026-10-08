import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAucationsStore } from "./aucationsStore";
import aucationApi from "../api/aucationApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("aucationsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    const store = useAucationsStore();
    expect(store.aucations).toEqual([]);
    expect(store.aucation).toBeNull();
    expect(store.isAucation).toBe(false);
    expect(store.isAucationAdd).toBe(false);
    expect(store.isAucationAdded).toBe(false);
    expect(store.isAucationChange).toBe(false);
    expect(store.isAucationChanged).toBe(false);
    expect(store.isAucationChangeCover).toBe(false);
    expect(store.isAucationChangedCover).toBe(false);
    expect(store.isAucationDelete).toBe(false);
    expect(store.isAucationDeleted).toBe(false);
    expect(store.isBidAdd).toBe(false);
    expect(store.isBidAdded).toBe(false);
    expect(store.isBidDelete).toBe(false);
    expect(store.isBidDeleted).toBe(false);
    expect(store.isAucationDeleteAll).toBe(false);
    expect(store.isAucationDeletedAll).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useAucationsStore();
    store.setAucations([{ id: 1 }]);
    expect(store.aucations).toEqual([{ id: 1 }]);

    store.setAucation({ id: 2 });
    expect(store.aucation).toEqual({ id: 2 });

    store.setIsAucation(true);
    expect(store.isAucation).toBe(true);

    store.setIsAucationAdd(true);
    expect(store.isAucationAdd).toBe(true);

    store.setIsAucationAdded(true);
    expect(store.isAucationAdded).toBe(true);

    store.setIsAucationChange(true);
    expect(store.isAucationChange).toBe(true);

    store.setIsAucationChanged(true);
    expect(store.isAucationChanged).toBe(true);

    store.setIsAucationChangeCover(true);
    expect(store.isAucationChangeCover).toBe(true);

    store.setIsAucationChangedCover(true);
    expect(store.isAucationChangedCover).toBe(true);

    store.setIsAucationDelete(true);
    expect(store.isAucationDelete).toBe(true);

    store.setIsAucationDeleted(true);
    expect(store.isAucationDeleted).toBe(true);

    store.setIsBidAdd(true);
    expect(store.isBidAdd).toBe(true);

    store.setIsBidAdded(true);
    expect(store.isBidAdded).toBe(true);

    store.setIsBidDelete(true);
    expect(store.isBidDelete).toBe(true);

    store.setIsBidDeleted(true);
    expect(store.isBidDeleted).toBe(true);

    store.setIsAucationDeleteAll(true);
    expect(store.isAucationDeleteAll).toBe(true);

    store.setIsAucationDeletedAll(true);
    expect(store.isAucationDeletedAll).toBe(true);
  });

  describe("asyncSetAucations", () => {
    it("should set aucations on success", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "getAucations").mockResolvedValue([{ id: 10 }]);

      await store.asyncSetAucations({ is_me: 1 });
      expect(store.aucations).toEqual([{ id: 10 }]);
    });

    it("should fallback to empty array on error", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "getAucations").mockRejectedValue(new Error("Error"));

      await store.asyncSetAucations();
      expect(store.aucations).toEqual([]);
    });
  });

  describe("asyncSetAucation", () => {
    it("should set aucation and setIsAucation to true on success", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "getAucationById").mockResolvedValue({ id: 5 });

      await store.asyncSetAucation(5);
      expect(store.aucation).toEqual({ id: 5 });
      expect(store.isAucation).toBe(true);
    });

    it("should set aucation to null and setIsAucation to true on error", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "getAucationById").mockRejectedValue(new Error("Error"));

      await store.asyncSetAucation(99);
      expect(store.aucation).toBeNull();
      expect(store.isAucation).toBe(true);
    });
  });

  describe("asyncSetIsAucationAdd", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postAucation").mockResolvedValue({ id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationAdd("Judul", "Deskripsi", 10000, "2026-12-31 23:59:59");
      expect(successSpy).toHaveBeenCalledWith("Lelang berhasil ditambahkan!");
      expect(store.isAucationAdded).toBe(true);
      expect(store.isAucationAdd).toBe(true);
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postAucation").mockRejectedValue(new Error("Gagal tambah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationAdd("Judul", "Deskripsi", 10000, "2026-12-31 23:59:59");
      expect(errorSpy).toHaveBeenCalledWith("Gagal tambah");
      expect(store.isAucationAdded).toBe(false);
      expect(store.isAucationAdd).toBe(true);
    });
  });

  describe("asyncSetIsAucationChange", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "putAucation").mockResolvedValue("Berhasil edit");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChange(1, "Judul", "Deskripsi", 10000, "2026-12-31 23:59:59");
      expect(successSpy).toHaveBeenCalledWith("Berhasil edit");
      expect(store.isAucationChanged).toBe(true);
      expect(store.isAucationChange).toBe(true);
    });

    it("should handle success with fallback message when message is empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "putAucation").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChange(1, "Judul", "Deskripsi", 10000, "2026-12-31 23:59:59");
      expect(successSpy).toHaveBeenCalledWith("Lelang berhasil diperbarui!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "putAucation").mockRejectedValue(new Error("Gagal edit"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChange(1, "Judul", "Deskripsi", 10000, "2026-12-31 23:59:59");
      expect(errorSpy).toHaveBeenCalledWith("Gagal edit");
      expect(store.isAucationChanged).toBe(false);
      expect(store.isAucationChange).toBe(true);
    });
  });

  describe("asyncSetIsAucationChangeCover", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postAucationCover").mockResolvedValue("Cover diperbarui");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover diperbarui");
      expect(store.isAucationChangedCover).toBe(true);
      expect(store.isAucationChangeCover).toBe(true);
    });

    it("should handle success with fallback message when message is empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postAucationCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover lelang berhasil diperbarui!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postAucationCover").mockRejectedValue(new Error("File corrupt"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationChangeCover(1, new Blob());
      expect(errorSpy).toHaveBeenCalledWith("File corrupt");
      expect(store.isAucationChangedCover).toBe(false);
      expect(store.isAucationChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsAucationDelete", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAucation").mockResolvedValue("Lelang terhapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Lelang terhapus");
      expect(store.isAucationDeleted).toBe(true);
      expect(store.isAucationDelete).toBe(true);
    });

    it("should handle success with fallback message when message is empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAucation").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Lelang berhasil dihapus!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAucation").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isAucationDeleted).toBe(false);
      expect(store.isAucationDelete).toBe(true);
    });
  });

  describe("asyncSetIsBidAdd", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postBid").mockResolvedValue("Bid masuk");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsBidAdd(1, 500000);
      expect(successSpy).toHaveBeenCalledWith("Bid masuk");
      expect(store.isBidAdded).toBe(true);
      expect(store.isBidAdd).toBe(true);
    });

    it("should handle success with fallback message when empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postBid").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsBidAdd(1, 500000);
      expect(successSpy).toHaveBeenCalledWith("Tawaran berhasil diajukan!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "postBid").mockRejectedValue(new Error("Bid terlalu rendah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsBidAdd(1, 100);
      expect(errorSpy).toHaveBeenCalledWith("Bid terlalu rendah");
      expect(store.isBidAdded).toBe(false);
      expect(store.isBidAdd).toBe(true);
    });
  });

  describe("asyncSetIsBidDelete", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteBid").mockResolvedValue("Bid dibatalkan");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsBidDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Bid dibatalkan");
      expect(store.isBidDeleted).toBe(true);
      expect(store.isBidDelete).toBe(true);
    });

    it("should handle success with fallback message when empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteBid").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsBidDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Tawaran berhasil dibatalkan!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteBid").mockRejectedValue(new Error("Gagal batal bid"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsBidDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Gagal batal bid");
      expect(store.isBidDeleted).toBe(false);
      expect(store.isBidDelete).toBe(true);
    });
  });

  describe("asyncSetIsAucationDeleteAll", () => {
    it("should handle success path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAllAucations").mockResolvedValue("Semua terhapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua terhapus");
      expect(store.isAucationDeletedAll).toBe(true);
      expect(store.isAucationDeleteAll).toBe(true);
    });

    it("should handle success with fallback message when empty", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAllAucations").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua data lelang berhasil dihapus!");
    });

    it("should handle failure path", async () => {
      const store = useAucationsStore();
      vi.spyOn(aucationApi, "deleteAllAucations").mockRejectedValue(new Error("Gagal hapus semua"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAucationDeleteAll();
      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus semua");
      expect(store.isAucationDeletedAll).toBe(false);
      expect(store.isAucationDeleteAll).toBe(true);
    });
  });
});
