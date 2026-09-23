import { apiRequest } from "../lib/axios";

// ============================================================
// AUTH
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

// ============================================================
// KURIKULUM / PERIODE AKADEMIK
// ============================================================

export interface KurikulumApiItem {
  id: number;
  nama: string;
  semester: string;
  tahun: string;
  description: string | null;

  total_mata_kuliah: number;
  total_sesi: number;
  total_dosen: number;
  total_kelas: number;
  total_ruang: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export async function getKurikulumApi(): Promise<KurikulumApiItem[]> {
  const response = await apiRequest<ApiResponse<KurikulumApiItem[]>>(
    "/api/master-data/kurikulum",
    {
      method: "GET",
    },
  );

  return response.data;
}

export async function getKurikulumByIdApi(
  id: string | number,
): Promise<KurikulumApiItem> {
  const response = await apiRequest<ApiResponse<KurikulumApiItem>>(
    `/api/master-data/kurikulum/${id}`,
    {
      method: "GET",
    },
  );

  return response.data;
}

export interface CreateKurikulumPayload {
  semester: string;
  tahun_ajaran: number;
  description: string | null;
}

export async function createKurikulumApi(
  payload: CreateKurikulumPayload,
  sourceKurikulumId?: string | null,
): Promise<KurikulumApiItem> {
  let endpoint = "/api/master-data/kurikulum";

  if (sourceKurikulumId) {
    const params = new URLSearchParams({
      copy: "true",
      kurikulumId: sourceKurikulumId,
    });

    endpoint += `?${params.toString()}`;
  }

  const response = await apiRequest<ApiResponse<KurikulumApiItem>>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateKurikulumApi(
  id: string | number,
  payload: Partial<CreateKurikulumPayload>,
): Promise<KurikulumApiItem | null> {
  const response = await apiRequest<ApiResponse<KurikulumApiItem | null>>(
    `/api/master-data/kurikulum/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteKurikulumApi(
  id: string | number,
): Promise<unknown> {
  const response = await apiRequest<ApiResponse<unknown>>(
    `/api/master-data/kurikulum/${id}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}

// ============================================================
// MATA KULIAH
// ============================================================

export interface MataKuliahApiItem {
  id: number;
  kode: number;
  nama: string;
  sks: number;
  prodi: string;
  jenis: string;
  kelompok: string;
  tipe_kelas: string;
  semester: number;
}

export interface MataKuliahListResponse {
  message: string;
  data: MataKuliahApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MataKuliahPayload {
  kode: number;
  nama: string;
  sks: number;
  prodi: string;
  jenis: string;
  kelompok: string;
  tipe_kelas: string;
  semester: number;
}

/**
 * Ambil seluruh mata kuliah yang terhubung dengan satu kurikulum.
 *
 * Kita memakai limit=all + paginate=false karena UI Kurikulum saat ini
 * belum memiliki pagination sendiri.
 */
export async function getMataKuliahByKurikulumApi(
  kurikulumId: string | number,
): Promise<MataKuliahApiItem[]> {
  const params = new URLSearchParams({
    limit: "all",
    paginate: "false",
    sortBy: "semester",
    order: "asc",
  });

  const response = await apiRequest<MataKuliahListResponse>(
    `/api/master-data/mata-kuliah/kurikulum/${kurikulumId}?${params.toString()}`,
    {
      method: "GET",
    },
  );

  return response.data;
}

/**
 * Tambah mata kuliah sekaligus menghubungkannya ke kurikulum.
 *
 * POST /api/master-data/mata-kuliah/:kurikulumId
 */
export async function createMataKuliahApi(
  kurikulumId: string | number,
  payload: MataKuliahPayload,
): Promise<MataKuliahApiItem> {
  const response = await apiRequest<ApiResponse<MataKuliahApiItem>>(
    `/api/master-data/mata-kuliah/${kurikulumId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

/**
 * Edit mata kuliah.
 *
 * PUT /api/master-data/mata-kuliah/:id
 */
export async function updateMataKuliahApi(
  id: string | number,
  payload: MataKuliahPayload,
): Promise<MataKuliahApiItem> {
  const response = await apiRequest<ApiResponse<MataKuliahApiItem>>(
    `/api/master-data/mata-kuliah/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

/**
 * Hapus mata kuliah.
 *
 * Backend juga menghapus relasi kurikulum-mata kuliah.
 */
export async function deleteMataKuliahApi(
  id: string | number,
): Promise<unknown> {
  const response = await apiRequest<ApiResponse<unknown>>(
    `/api/master-data/mata-kuliah/${id}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}

// ============================================================
// RUANGAN
// ============================================================

export interface RuangApiItem {
  id: number;
  nama: string;
}

export interface RuangPayload {
  nama: string;
}

/**
 * Ambil seluruh ruang yang terhubung dengan kurikulum tertentu.
 *
 * GET /api/master-data/ruang/kurikulum/:kurikulumId
 */
export async function getRuangByKurikulumApi(
  kurikulumId: string | number,
): Promise<RuangApiItem[]> {
  const response = await apiRequest<{
    message: string;
    data: RuangApiItem[];
  }>(`/api/master-data/ruang/kurikulum/${kurikulumId}`, {
    method: "GET",
  });

  return response.data;
}

/**
 * Tambah ruang baru dan langsung hubungkan ke kurikulum.
 *
 * POST /api/master-data/ruang/:kurikulumId
 */
export async function createRuangApi(
  kurikulumId: string | number,
  payload: RuangPayload,
): Promise<RuangApiItem> {
  const response = await apiRequest<{
    message: string;
    data: RuangApiItem;
  }>(`/api/master-data/ruang/${kurikulumId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Edit data ruang.
 *
 * PUT /api/master-data/ruang/:id
 */
export async function updateRuangApi(
  id: string | number,
  payload: RuangPayload,
): Promise<RuangApiItem> {
  const response = await apiRequest<{
    message: string;
    data: RuangApiItem;
  }>(`/api/master-data/ruang/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Hapus ruang.
 *
 * DELETE /api/master-data/ruang/:id
 */
export async function deleteRuangApi(
  id: string | number,
): Promise<RuangApiItem> {
  const response = await apiRequest<{
    message: string;
    data: RuangApiItem;
  }>(`/api/master-data/ruang/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

// ============================================================
// DOSEN
// ============================================================

export interface DosenApiItem {
  id: number;
  nama: string;
  nidn: string;
  jabatan_akademik: string;
}

export interface DosenPayload {
  nama: string;
  nidn: string;
  jabatan_akademik: string;
}

/**
 * Ambil semua dosen yang terhubung dengan kurikulum tertentu.
 *
 * GET /api/master-data/dosen/kurikulum/:kurikulumId
 */
export async function getDosenByKurikulumApi(
  kurikulumId: string | number,
): Promise<DosenApiItem[]> {
  const response = await apiRequest<{
    message: string;
    data: DosenApiItem[];
  }>(`/api/master-data/dosen/kurikulum/${kurikulumId}`, {
    method: "GET",
  });

  return response.data;
}

/**
 * Tambah dosen baru sekaligus menghubungkan ke kurikulum.
 *
 * POST /api/master-data/dosen/:kurikulumId
 */
export async function createDosenApi(
  kurikulumId: string | number,
  payload: DosenPayload,
): Promise<DosenApiItem> {
  const response = await apiRequest<{
    message: string;
    data: DosenApiItem;
  }>(`/api/master-data/dosen/${kurikulumId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Edit dosen.
 *
 * PUT /api/master-data/dosen/:id
 */
export async function updateDosenApi(
  id: string | number,
  payload: DosenPayload,
): Promise<DosenApiItem> {
  const response = await apiRequest<{
    message: string;
    data: DosenApiItem;
  }>(`/api/master-data/dosen/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Hapus dosen.
 *
 * DELETE /api/master-data/dosen/:id
 */
export async function deleteDosenApi(
  id: string | number,
): Promise<DosenApiItem> {
  const response = await apiRequest<{
    message: string;
    data: DosenApiItem;
  }>(`/api/master-data/dosen/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

// ============================================================
// KELAS
// ============================================================

export interface KelasApiItem {
  id: number;
  prodi: string;
  semester: number;
  kelas: string;
  kode_kelas: string;
}

export interface KelasCreatePayload {
  prodi: string;
  semester: number;

  /**
   * FE tetap mengirim dua nilai ini sesuai form.
   * BE yang menentukan hasil generate kelas.
   */
  kelas_teori?: number;
  kelas_praktikum?: number;

  /**
   * Alternatif jumlah kelas yang didukung BE.
   * Nilainya 1 - 4.
   */
  jumlah_kelas?: number;
}

export interface KelasUpdatePayload {
  prodi?: string;
  semester?: number;
  kelas?: string;
  kode_kelas?: string;
}

/**
 * Ambil semua kelas yang terhubung dengan kurikulum tertentu.
 *
 * GET /api/master-data/kelas/kurikulum/:kurikulumId
 */
export async function getKelasByKurikulumApi(
  kurikulumId: string | number,
): Promise<KelasApiItem[]> {
  const response = await apiRequest<{
    message: string;
    data: KelasApiItem[];
  }>(`/api/master-data/kelas/kurikulum/${kurikulumId}`, {
    method: "GET",
  });

  return response.data;
}

/**
 * Tambah kelas.
 *
 * BE akan generate kelas secara otomatis berdasarkan:
 * - kelas_teori
 * - kelas_praktikum
 * - jumlah_kelas
 *
 * Response `data` dari BE bisa berupa satu object atau array.
 */
export async function createKelasApi(
  kurikulumId: string | number,
  payload: KelasCreatePayload,
): Promise<KelasApiItem[]> {
  const response = await apiRequest<{
    message: string;
    data: KelasApiItem | KelasApiItem[];
  }>(`/api/master-data/kelas/${kurikulumId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return Array.isArray(response.data) ? response.data : [response.data];
}

/**
 * Edit satu kelas.
 *
 * PUT /api/master-data/kelas/:id
 */
export async function updateKelasApi(
  id: string | number,
  payload: KelasUpdatePayload,
): Promise<KelasApiItem> {
  const response = await apiRequest<{
    message: string;
    data: KelasApiItem;
  }>(`/api/master-data/kelas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Hapus satu kelas.
 *
 * DELETE /api/master-data/kelas/:id
 */
export async function deleteKelasApi(
  id: string | number,
): Promise<KelasApiItem> {
  const response = await apiRequest<{
    message: string;
    data: KelasApiItem;
  }>(`/api/master-data/kelas/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

// ============================================================
// SESI
// ============================================================

export interface SesiApiItem {
  id: number;
  nama: number;
  jam_mulai: string;
  jam_akhir: string;
}

export interface SesiPayload {
  nama: number;
  jam_mulai: string;
  jam_akhir: string;
}

/**
 * Ambil semua sesi yang terhubung dengan kurikulum tertentu.
 *
 * GET /api/master-data/sesi/kurikulum/:kurikulumId
 */
export async function getSesiByKurikulumApi(
  kurikulumId: string | number,
): Promise<SesiApiItem[]> {
  const response = await apiRequest<{
    message: string;
    data: SesiApiItem[];
  }>(`/api/master-data/sesi/kurikulum/${kurikulumId}`, {
    method: "GET",
  });

  return response.data;
}

/**
 * Tambah sesi dan hubungkan ke kurikulum.
 *
 * POST /api/master-data/sesi/:kurikulumId
 */
export async function createSesiApi(
  kurikulumId: string | number,
  payload: SesiPayload,
): Promise<SesiApiItem> {
  const response = await apiRequest<{
    message: string;
    data: SesiApiItem;
  }>(`/api/master-data/sesi/${kurikulumId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Edit sesi.
 *
 * PUT /api/master-data/sesi/:id
 */
export async function updateSesiApi(
  id: string | number,
  payload: Partial<SesiPayload>,
): Promise<SesiApiItem> {
  const response = await apiRequest<{
    message: string;
    data: SesiApiItem;
  }>(`/api/master-data/sesi/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Hapus sesi.
 *
 * Backend juga menghapus relasi kurikulum-sesi.
 */
export async function deleteSesiApi(id: string | number): Promise<SesiApiItem> {
  const response = await apiRequest<{
    message: string;
    data: SesiApiItem;
  }>(`/api/master-data/sesi/${id}`, {
    method: "DELETE",
  });

  return response.data;
}
