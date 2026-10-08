<template>
  <div v-if="!profile || !aucation" class="flex flex-col items-center justify-center py-24">
    <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    <p class="text-sm font-medium text-slate-600 mt-3">Memuat detail lelang...</p>
  </div>

  <div v-else class="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
    <!-- Top Nav / Back button & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <RouterLink
        to="/"
        data-testid="back-to-home-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft :size="18" />
        Kembali ke Dashboard Lelang
      </RouterLink>

      <!-- Owner Actions -->
      <div v-if="isOwner" class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          data-testid="edit-cover-btn"
          @click="showCoverModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus :size="16" />
          Ubah Cover
        </button>
        <button
          type="button"
          data-testid="edit-detail-aucation-btn"
          @click="showEditModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <Edit3 :size="16" />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-aucation-btn"
          @click="handleDelete"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 :size="16" />
          Hapus
        </button>
      </div>

        <!-- Bidder Actions when not owner -->
      <div v-else-if="!isClosed" class="flex items-center gap-2">
        <button
          v-if="aucation.my_bid"
          type="button"
          data-testid="cancel-bid-btn"
          @click="handleCancelBid"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Ban :size="16" />
          Batalkan Tawaran
        </button>

        <button
          type="button"
          data-testid="place-bid-btn"
          @click="showBidModal = true"
          class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 shadow-md shadow-emerald-800/25 transition-all"
        >
          <Coins :size="16" />
          Ajukan Tawaran
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Large Cover Header -->
      <div v-if="aucation.cover" class="relative w-full h-72 sm:h-96 bg-slate-900 overflow-hidden">
        <img
          :src="aucation.cover"
          :alt="aucation.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div class="p-6 sm:p-8 space-y-8">
        <!-- Title & Status Header -->
        <div class="space-y-3">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="font-mono text-xs font-bold text-slate-600">
              #{{ aucation.id }}
            </span>
            <span
              v-if="isClosed"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
            >
              <CheckCircle2 :size="14" />
              Selesai / Ditutup
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <Clock :size="14" />
              Lelang Berlangsung
            </span>

            <span
              v-if="isOwner"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              Barang Milik Anda
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ aucation.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <div class="flex items-center gap-1.5">
              <User :size="14" class="shrink-0 text-slate-500" />
              <span>Penjual: <strong class="text-slate-700">{{ aucation.author?.name || "Anonim" }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar :size="14" class="shrink-0 text-slate-500" />
              <span>Dibuat: <strong class="text-slate-700">{{ formatDate(aucation.created_at) }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock :size="14" class="shrink-0 text-slate-500" />
              <span>Batas Penutupan: <strong class="text-slate-700">{{ formatDate(aucation.closed_at) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Price & Bid Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p class="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Harga Penawaran Awal
            </p>
            <p class="text-xl font-bold text-slate-800 mt-1">
              {{ formatRupiah(aucation.start_bid) }}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Penawaran Tertinggi
            </p>
            <p class="text-2xl font-black text-emerald-800 mt-1">
              {{ formatRupiah(highestBid) }}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Tawaran Anda
            </p>
            <p class="text-xl font-bold text-indigo-800 mt-1">
              {{ aucation.my_bid ? formatRupiah(aucation.my_bid.bid) : "Belum menawar" }}
            </p>
          </div>
        </div>

        <!-- Markdown Description Section -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Deskripsi & Spesifikasi Barang
          </h2>
          <div class="p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <MarkdownViewer :content="aucation.description || 'Tidak ada deskripsi rincian.'" />
          </div>
        </div>

        <!-- Bids History Section -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Coins :size="16" class="text-emerald-700" />
              <span>Riwayat Penawaran ({{ bidsList.length }})</span>
            </h2>
          </div>

          <div v-if="bidsList.length === 0" class="p-8 text-center text-slate-600 bg-slate-50/60 rounded-2xl border border-slate-100">
            <Coins :size="32" class="mx-auto text-slate-400 mb-2" />
            <p class="text-sm font-medium">Belum ada penawaran yang diajukan untuk barang ini.</p>
          </div>

          <div v-else class="overflow-hidden border border-slate-200/80 rounded-2xl">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th class="px-5 py-3.5">Urutan</th>
                  <th class="px-5 py-3.5">Nominal Penawaran</th>
                  <th class="px-5 py-3.5">Waktu Penawaran</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(b, index) in bidsList"
                  :key="b.id"
                  class="hover:bg-slate-50/80 transition-colors"
                  :class="index === 0 ? 'bg-emerald-50/30 font-semibold' : ''"
                >
                  <td class="px-5 py-3.5 flex items-center gap-2">
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      :class="index === 0 ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'"
                    >
                      #{{ index + 1 }}
                    </span>
                    <span v-if="index === 0" class="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                      (Tertinggi)
                    </span>
                  </td>
                  <td class="px-5 py-3.5 font-bold text-slate-900">
                    {{ formatRupiah(b.bid) }}
                  </td>
                  <td class="px-5 py-3.5 text-xs text-slate-600">
                    {{ formatDate(b.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangeCoverModal
      :show="showCoverModal"
      :aucation="aucation"
      @close="showCoverModal = false"
    />
    <ChangeModal
      :show="showEditModal"
      :aucation="aucation"
      @close="showEditModal = false"
    />
    <BidModal
      :show="showBidModal"
      :aucation="aucation"
      @close="showBidModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import BidModal from "../modals/BidModal.vue";
import {
  ArrowLeft,
  ImagePlus,
  Edit3,
  Trash2,
  Coins,
  Ban,
  CheckCircle2,
  Clock,
  User,
  Calendar,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);
const aucation = computed(() => aucationsStore.aucation);

const showCoverModal = ref(false);
const showEditModal = ref(false);
const showBidModal = ref(false);

const aucationId = computed(() => route.params.aucationId);

onMounted(() => {
  if (aucationId.value) {
    aucationsStore.asyncSetAucation(aucationId.value);
  }
});

const isOwner = computed(() => {
  if (!profile.value || !aucation.value) return false;
  return profile.value.id === aucation.value.user_id;
});

const isClosed = computed(() => {
  if (!aucation.value?.closed_at) return false;
  return new Date(aucation.value.closed_at).getTime() <= Date.now();
});

const bidsList = computed(() => {
  if (!aucation.value?.bids || !Array.isArray(aucation.value.bids)) return [];
  const normalized = aucation.value.bids.map((b, idx) => ({
    id: b?.id || idx + 1,
    bid: Number(b?.bid || b),
    created_at: b?.created_at || aucation.value.created_at,
  }));

  return normalized.sort((a, b) => b.bid - a.bid);
});

const highestBid = computed(() => {
  if (bidsList.value.length > 0) {
    return bidsList.value[0].bid;
  }
  return Number(aucation.value?.start_bid || 0);
});

watch(
  () => aucationsStore.isAucationDeleted,
  (isDeleted) => {
    if (isDeleted) {
      aucationsStore.setIsAucationDeleted(false);
      router.push("/");
    }
  }
);

watch(
  () => aucationsStore.isBidDeleted,
  (isDeleted) => {
    if (isDeleted) {
      aucationsStore.setIsBidDeleted(false);
      aucationsStore.asyncSetAucation(aucationId.value);
    }
  }
);

async function handleDelete() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus lelang ini?");
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsAucationDelete(aucation.value.id);
  }
}

async function handleCancelBid() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin membatalkan tawaran Anda?");
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsBidDelete(aucation.value.id);
  }
}
</script>
