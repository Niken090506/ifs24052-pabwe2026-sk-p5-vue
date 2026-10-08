<template>
  <div v-if="profile" class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Lelang
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Jelajahi dan ikuti sesi pelelangan barang secara langsung dan transparan.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        <button
          v-if="myAuctionsCount > 0"
          type="button"
          data-testid="delete-all-aucations-btn"
          @click="handleDeleteAll"
          class="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
        >
          <Trash2 :size="16" />
          <span>Hapus Semua Lelang Saya</span>
        </button>

        <button
          type="button"
          data-testid="add-aucation-btn"
          @click="showAddModal = true"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus :size="18" :stroke-width="2.5" />
          <span>Tambah Lelang</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Lelang
          </p>
          <h3 class="text-3xl font-black text-slate-800 mt-1">{{ totalCount }}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Gavel :size="26" :stroke-width="2" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lelang Berlangsung
          </p>
          <h3 class="text-3xl font-black text-emerald-600 mt-1">
            {{ activeCount }}
          </h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Clock :size="26" :stroke-width="2" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lelang Ditutup
          </p>
          <h3 class="text-3xl font-black text-slate-600 mt-1">{{ closedCount }}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <CheckCircle2 :size="26" :stroke-width="2" />
        </div>
      </div>
    </div>

    <!-- Controls Section: Filter & Live Search -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search
            :size="18"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            data-testid="search-aucation-input"
            v-model="searchQuery"
            placeholder="Cari judul atau rincian lelang..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Filter :size="16" /> Filter:
          </span>
          <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 flex-wrap">
            <button
              type="button"
              data-testid="filter-all-btn"
              @click="filter = ''"
              class="px-3 py-1.5 rounded-lg transition-all"
              :class="filter === '' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="filter-me-btn"
              @click="filter = 'me'"
              class="px-3 py-1.5 rounded-lg transition-all"
              :class="filter === 'me' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              Lelang Saya
            </button>
            <button
              type="button"
              data-testid="filter-open-btn"
              @click="filter = 'open'"
              class="px-3 py-1.5 rounded-lg transition-all"
              :class="filter === 'open' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              Berlangsung
            </button>
            <button
              type="button"
              data-testid="filter-closed-btn"
              @click="filter = 'closed'"
              class="px-3 py-1.5 rounded-lg transition-all"
              :class="filter === 'closed' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              Ditutup
            </button>
          </div>
        </div>
      </div>

      <!-- Aucations Grid -->
      <div class="p-6">
        <div v-if="filteredAucations.length === 0" class="py-16 text-center text-slate-400">
          <Gavel :size="48" class="mx-auto text-slate-300 mb-3" />
          <h3 class="text-base font-bold text-slate-700">Tidak ada sesi lelang ditemukan</h3>
          <p class="text-sm mt-1 max-w-sm mx-auto text-slate-500">
            Belum ada barang lelang yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in filteredAucations"
            :key="item.id"
            :data-testid="'aucation-card-' + item.id"
            class="group rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
          >
            <!-- Card Cover Image & Badge -->
            <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                v-if="item.cover"
                :src="item.cover"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
                <Image :size="36" />
                <span class="text-xs mt-1 text-slate-400">Tidak ada gambar</span>
              </div>

              <!-- Status Badge -->
              <div class="absolute top-3 left-3">
                <span
                  v-if="checkIsClosed(item)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs"
                >
                  <CheckCircle2 :size="13" /> Ditutup
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-xs animate-pulse"
                >
                  <Clock :size="13" /> Berlangsung
                </span>
              </div>

              <!-- Owner indicator -->
              <div v-if="profile.id === item.user_id" class="absolute top-3 right-3">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
                  Milik Saya
                </span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 class="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {{ item.title }}
                </h3>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1">
                  {{ item.description || "Tidak ada deskripsi rincian." }}
                </p>
              </div>

              <!-- Pricing section -->
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">Harga Awal:</span>
                  <span class="font-bold text-slate-700">{{ formatRupiah(item.start_bid) }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">Tawaran Tertinggi:</span>
                  <span class="font-extrabold text-emerald-600 text-sm">
                    {{ formatRupiah(getHighestBid(item)) }}
                  </span>
                </div>
              </div>

              <!-- Card Footer Meta -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div class="flex items-center gap-1.5 truncate max-w-[150px]">
                  <img
                    v-if="item.author?.photo"
                    :src="item.author.photo"
                    :alt="item.author.name"
                    class="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  <User v-else :size="14" class="shrink-0" />
                  <span class="truncate">{{ item.author?.name || "Penjual" }}</span>
                </div>

                <div class="flex items-center gap-1 font-semibold text-slate-500 shrink-0">
                  <Calendar :size="13" />
                  <span>{{ formatDate(item.closed_at) }}</span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 pt-1">
                <RouterLink
                  :to="`/aucations/${item.id}`"
                  :data-testid="'detail-aucation-btn-' + item.id"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Eye :size="14" />
                  <span>Detail</span>
                </RouterLink>

                <template v-if="profile.id === item.user_id">
                  <button
                    type="button"
                    :data-testid="'edit-aucation-btn-' + item.id"
                    @click="openEditModal(item)"
                    class="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                    title="Ubah Data"
                  >
                    <Edit3 :size="15" />
                  </button>
                  <button
                    type="button"
                    :data-testid="'delete-aucation-btn-' + item.id"
                    @click="handleDeleteItem(item.id)"
                    class="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    title="Hapus Lelang"
                  >
                    <Trash2 :size="15" />
                  </button>
                </template>

                <button
                  v-else-if="!checkIsClosed(item)"
                  type="button"
                  :data-testid="'bid-aucation-btn-' + item.id"
                  @click="openBidModal(item)"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                >
                  <Coins :size="14" />
                  <span>Tawar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddModal :show="showAddModal" @close="showAddModal = false" />
    <ChangeModal
      :show="showEditModal"
      :aucation="selectedItem"
      @close="showEditModal = false"
    />
    <BidModal
      :show="showBidModal"
      :aucation="selectedItem"
      @close="showBidModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { formatRupiah, formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import BidModal from "../modals/BidModal.vue";
import {
  Gavel,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Image,
  User,
  Calendar,
  Eye,
  Edit3,
  Coins,
} from "lucide-vue-next";

const route = useRoute();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);
const aucations = computed(() => aucationsStore.aucations);

const filter = ref("");
const searchQuery = ref("");

const showAddModal = ref(false);
const showEditModal = ref(false);
const showBidModal = ref(false);
const selectedItem = ref(null);

function fetchFilteredAucations() {
  if (filter.value === "me") {
    aucationsStore.asyncSetAucations({ is_me: 1 });
  } else if (filter.value === "open") {
    aucationsStore.asyncSetAucations({ is_closed: 1 });
  } else if (filter.value === "closed") {
    aucationsStore.asyncSetAucations({ is_closed: 0 });
  } else {
    aucationsStore.asyncSetAucations();
  }
}

onMounted(() => {
  if (route.query?.filter === "me") {
    filter.value = "me";
  }
  fetchFilteredAucations();
});

watch(
  () => route.query?.filter,
  (newFilter) => {
    filter.value = newFilter === "me" ? "me" : "";
  }
);

watch(filter, () => {
  fetchFilteredAucations();
});

watch(
  () => [aucationsStore.isAucationDeleted, aucationsStore.isAucationDeletedAll],
  ([isDeleted, isDeletedAll]) => {
    if (isDeleted) {
      aucationsStore.setIsAucationDeleted(false);
      fetchFilteredAucations();
    }
    if (isDeletedAll) {
      aucationsStore.setIsAucationDeletedAll(false);
      fetchFilteredAucations();
    }
  }
);

function checkIsClosed(item) {
  if (!item?.closed_at) return false;
  return new Date(item.closed_at).getTime() <= Date.now();
}

function getHighestBid(item) {
  if (!item) return 0;
  if (Array.isArray(item.bids) && item.bids.length > 0) {
    return Math.max(...item.bids.map((b) => Number(b?.bid || b)));
  }
  return Number(item.start_bid || 0);
}

const totalCount = computed(() => aucations.value.length);
const activeCount = computed(
  () => aucations.value.filter((a) => !checkIsClosed(a)).length
);
const closedCount = computed(
  () => aucations.value.filter((a) => checkIsClosed(a)).length
);
const myAuctionsCount = computed(() => {
  if (!profile.value) return 0;
  return aucations.value.filter((a) => a.user_id === profile.value.id).length;
});

const filteredAucations = computed(() => {
  return aucations.value.filter((item) => {
    if (!searchQuery.value.trim()) return true;
    const q = searchQuery.value.toLowerCase();
    const titleMatch = item.title && item.title.toLowerCase().includes(q);
    const descMatch = item.description && item.description.toLowerCase().includes(q);
    return titleMatch || descMatch;
  });
});

function openEditModal(item) {
  selectedItem.value = item;
  showEditModal.value = true;
}

function openBidModal(item) {
  selectedItem.value = item;
  showBidModal.value = true;
}

async function handleDeleteItem(itemId) {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus lelang ini?");
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsAucationDelete(itemId);
  }
}

async function handleDeleteAll() {
  const result = await showConfirmDialog(
    "Apakah Anda yakin ingin menghapus SEMUA data lelang milik Anda secara permanen?"
  );
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsAucationDeleteAll();
  }
}
</script>
