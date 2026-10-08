import apiHelper from "../../../helpers/apiHelper";

const aucationApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/aucations`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function getAucations({ is_me = "", is_closed = "" } = {}) {
    const params = new URLSearchParams();
    if (is_me !== "" && is_me !== null && is_me !== undefined) {
      params.append("is_me", is_me);
    }
    if (is_closed !== "" && is_closed !== null && is_closed !== undefined) {
      params.append("is_closed", is_closed);
    }

    const query = params.toString();
    const targetUrl = query ? `/?${query}` : "/";

    const response = await apiHelper.fetchData(_url(targetUrl), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data lelang");
    }

    return result.data?.aucations || [];
  }

  async function getAucationById(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil detail lelang");
    }

    return result.data?.aucation;
  }

  async function postAucation(title, description, start_bid, closed_at) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        start_bid: Number(start_bid),
        closed_at,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal menambahkan lelang baru");
    }

    return result.data;
  }

  async function putAucation(aucationId, title, description, start_bid, closed_at) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        start_bid: Number(start_bid),
        closed_at,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal memperbarui lelang");
    }

    return result.message;
  }

  async function postAucationCover(aucationId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${aucationId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah cover lelang");
    }

    return result.message;
  }

  async function deleteAucation(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal menghapus lelang");
    }

    return result.message;
  }

  async function postBid(aucationId, bid) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}/bids`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bid: Number(bid),
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengajukan tawaran lelang");
    }

    return result.message;
  }

  async function deleteBid(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}/bids`), {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal membatalkan tawaran lelang");
    }

    return result.message;
  }

  async function deleteAllAucations() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal menghapus seluruh lelang");
    }

    return result.message;
  }

  return {
    getAucations,
    getAucationById,
    postAucation,
    putAucation,
    postAucationCover,
    deleteAucation,
    postBid,
    deleteBid,
    deleteAllAucations,
  };
})();

export default aucationApi;
