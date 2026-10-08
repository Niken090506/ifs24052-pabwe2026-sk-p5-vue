import { describe, it, expect, vi, beforeEach } from "vitest";
import aucationApi from "./aucationApi";
import apiHelper from "../../../helpers/apiHelper";

describe("aucationApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAucations", () => {
    it("should return aucations array on success with default params", async () => {
      const mockAucations = [{ id: 1, title: "Laptop Asus" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { aucations: mockAucations },
        }),
      });

      const result = await aucationApi.getAucations();
      expect(result).toEqual(mockAucations);
    });

    it("should return empty array if data.aucations is not provided", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const result = await aucationApi.getAucations({ is_me: 1, is_closed: 0 });
      expect(result).toEqual([]);
    });

    it("should build query params for is_me and is_closed correctly", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { aucations: [] },
        }),
      });

      await aucationApi.getAucations({ is_me: "1", is_closed: "1" });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("is_me=1&is_closed=1"),
        expect.anything()
      );
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(aucationApi.getAucations()).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.getAucations()).rejects.toThrow(
        "Gagal mengambil data lelang"
      );
    });
  });

  describe("getAucationById", () => {
    it("should return aucation detail on success", async () => {
      const mockAucation = { id: 2, title: "Oculus Quest" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { aucation: mockAucation },
        }),
      });

      const result = await aucationApi.getAucationById(2);
      expect(result).toEqual(mockAucation);
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Lelang tidak ditemukan",
        }),
      });

      await expect(aucationApi.getAucationById(99)).rejects.toThrow(
        "Lelang tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.getAucationById(99)).rejects.toThrow(
        "Gagal mengambil detail lelang"
      );
    });
  });

  describe("postAucation", () => {
    it("should post new aucation and return data on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { id: 10 },
        }),
      });

      const res = await aucationApi.postAucation(
        "Barang",
        "Deskripsi",
        100000,
        "2026-12-31 23:59:59"
      );
      expect(res).toEqual({ id: 10 });
    });

    it("should throw error on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Validasi gagal",
        }),
      });

      await expect(
        aucationApi.postAucation("Barang", "Deskripsi", 100, "2026-01-01")
      ).rejects.toThrow("Validasi gagal");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        aucationApi.postAucation("Barang", "Deskripsi", 100, "2026-01-01")
      ).rejects.toThrow("Gagal menambahkan lelang baru");
    });
  });

  describe("putAucation", () => {
    it("should put update and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const msg = await aucationApi.putAucation(
        1,
        "Barang Edit",
        "Deskripsi Edit",
        200000,
        "2026-12-31 23:59:59"
      );
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw error on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal update",
        }),
      });

      await expect(
        aucationApi.putAucation(1, "Barang", "Deskripsi", 200, "2026-01-01")
      ).rejects.toThrow("Gagal update");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        aucationApi.putAucation(1, "Barang", "Deskripsi", 200, "2026-01-01")
      ).rejects.toThrow("Gagal memperbarui lelang");
    });
  });

  describe("postAucationCover", () => {
    it("should post cover image and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await aucationApi.postAucationCover(1, file);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name fallback properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const blob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await aucationApi.postAucationCover(1, blob);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should throw error on upload failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      });

      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      await expect(aucationApi.postAucationCover(1, file)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      await expect(aucationApi.postAucationCover(1, file)).rejects.toThrow(
        "Gagal mengubah cover lelang"
      );
    });
  });

  describe("deleteAucation", () => {
    it("should delete aucation and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const msg = await aucationApi.deleteAucation(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error on delete fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Tidak dapat menghapus lelang",
        }),
      });

      await expect(aucationApi.deleteAucation(1)).rejects.toThrow(
        "Tidak dapat menghapus lelang"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.deleteAucation(1)).rejects.toThrow(
        "Gagal menghapus lelang"
      );
    });
  });

  describe("postBid", () => {
    it("should post bid and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil memberikan tawaran pada lelang",
        }),
      });

      const msg = await aucationApi.postBid(1, 150000);
      expect(msg).toBe("Berhasil memberikan tawaran pada lelang");
    });

    it("should throw error on bid fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Tawaran harus lebih tinggi",
        }),
      });

      await expect(aucationApi.postBid(1, 50000)).rejects.toThrow(
        "Tawaran harus lebih tinggi"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.postBid(1, 50000)).rejects.toThrow(
        "Gagal mengajukan tawaran lelang"
      );
    });
  });

  describe("deleteBid", () => {
    it("should delete bid and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus tawaran pada lelang",
        }),
      });

      const msg = await aucationApi.deleteBid(1);
      expect(msg).toBe("Berhasil menghapus tawaran pada lelang");
    });

    it("should throw error on delete bid fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Tawaran tidak ditemukan",
        }),
      });

      await expect(aucationApi.deleteBid(1)).rejects.toThrow(
        "Tawaran tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.deleteBid(1)).rejects.toThrow(
        "Gagal membatalkan tawaran lelang"
      );
    });
  });

  describe("deleteAllAucations", () => {
    it("should delete all aucations and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus semua data pelelangan",
        }),
      });

      const msg = await aucationApi.deleteAllAucations();
      expect(msg).toBe("Berhasil menghapus semua data pelelangan");
    });

    it("should throw error on delete all fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus semua lelang",
        }),
      });

      await expect(aucationApi.deleteAllAucations()).rejects.toThrow(
        "Gagal menghapus semua lelang"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(aucationApi.deleteAllAucations()).rejects.toThrow(
        "Gagal menghapus seluruh lelang"
      );
    });
  });
});
