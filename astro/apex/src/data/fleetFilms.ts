// Fleet films — the Wix Media clips every service surface shares (catalog
// cards, detail heroes; the home page carries its own richer fleet array),
// keyed by the car the service name leads with. Desktop rides the 720p
// masters; phones get the purpose-made 480p/24fps encodes (selection happens
// in each page's inline rendition script via data-src-desktop/mobile).
export type FilmSpec = { value: string; unit: string; label: string };
export type FleetFilm = {
  car: string;
  video: string;
  videoMobile: string;
  pos?: string;
  specs?: FilmSpec[];
};

export const FLEET_FILMS: FleetFilm[] = [
  {
    car: "TH-12W",
    video: "https://video.wixstatic.com/video/67964a_6d60600de434486fa612ce9589d9d2f1/720p/mp4/file.mp4",
    videoMobile: "https://video.wixstatic.com/video/67964a_93694f1c75a24e5c834e543b42f37299/480p/mp4/file.mp4",
    specs: [
      { value: "977", unit: "PS", label: "Power" },
      { value: "2.5", unit: "s", label: "0–60 mph" },
      { value: "340", unit: "km/h", label: "Top speed" },
    ],
  },
  {
    car: "ROCKET 4S",
    video: "https://video.wixstatic.com/video/67964a_27024945f4a848eba030934f3f8e183a/720p/mp4/file.mp4",
    videoMobile: "https://video.wixstatic.com/video/67964a_516a9a89852942b082597a46de9f5024/480p/mp4/file.mp4",
    pos: "50% 35%",
    specs: [
      { value: "1130", unit: "PS", label: "Power" },
      { value: "2.1", unit: "s", label: "0–60 mph" },
      { value: "305", unit: "km/h", label: "Top speed" },
    ],
  },
  {
    car: "APEX GT",
    video: "https://video.wixstatic.com/video/67964a_90326cc4dcfb401490328519e1b5951b/720p/mp4/file.mp4",
    videoMobile: "https://video.wixstatic.com/video/67964a_3575fd32d8594e429b0062445fd5ac47/480p/mp4/file.mp4",
    pos: "50% 85%",
    specs: [
      { value: "850", unit: "PS", label: "Power" },
      { value: "3.2", unit: "s", label: "0–60 mph" },
      { value: "320", unit: "km/h", label: "Top speed" },
    ],
  },
  {
    car: "PASSENGER HOT LAP",
    video: "https://video.wixstatic.com/video/67964a_837457251f164d0c9e4a08c325afa181/720p/mp4/file.mp4",
    videoMobile: "https://video.wixstatic.com/video/67964a_b1d850576a8b4a7d8e9e2130f3a8d17d/480p/mp4/file.mp4",
  },
];

export const filmFor = (name: string): FleetFilm | undefined =>
  FLEET_FILMS.find((f) => name.toUpperCase().startsWith(f.car));
