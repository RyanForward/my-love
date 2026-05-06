export type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  /** "HH:mm" ou null se só data */
  horario: string | null;
  imagemUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  /** UTC± horas para a API (ex.: -3). Se null, usa o fuso do navegador na requisição. */
  tzone: number | null;
  criadoEm: string;
};
