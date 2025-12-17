import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../../constants/globalConstants";

export const comptaApiSlice = createApi({
  reducerPath: "comptaApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL_API, credentials: "include" }),
  tagTypes: ["compta"],
  endpoints: (builder) => ({
    getChiffreAffaireMensuel: builder.query({
      query: (annee) => {
        let url = "compta/chiffre-affaire-mensuel/";
        if (annee) {
            url += `?annee=${annee}`;
        }
        return url;
      },
      providesTags: ["compta"],
    }),
    getChiffreAffaireAnnuel: builder.query({
      query: () => "compta/chiffre-affaire-annuel/",
      providesTags: ["compta"],
    }),
  }),
});

export const { useGetChiffreAffaireMensuelQuery, useGetChiffreAffaireAnnuelQuery } = comptaApiSlice;
