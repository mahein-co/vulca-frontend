import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithHeaders } from "../apiConfig";

export const comptaApiSlice = createApi({
  reducerPath: "comptaApi",
  baseQuery: baseQueryWithHeaders,
  tagTypes: ["compta"],
  endpoints: (builder) => ({
    // ✅ MULTI-TENANT: project_id enables cache isolation per project
    getChiffreAffaireMensuel: builder.query({
      query: ({ project_id, annee }) => {
        let url = "compta/chiffre-affaire-mensuel/";
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (annee) params.append('annee', annee);
        return params.toString() ? `${url}?${params.toString()}` : url;
      },
      providesTags: (result, error, { project_id }) => [
        { type: 'compta', id: `ca-mensuel-${project_id}` },
      ],
    }),

    getChiffreAffaireAnnuel: builder.query({
      query: (project_id) => `compta/chiffre-affaire-annuel/?project_id=${project_id}`,
      providesTags: (result, error, project_id) => [
        { type: 'compta', id: `ca-annuel-${project_id}` },
      ],
    }),

    saveBilanManual: builder.mutation({
      query: ({ data, project_id }) => ({
        url: `compta/bilans/manual/?project_id=${project_id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["compta"],
    }),

    saveCompteResultatManual: builder.mutation({
      query: ({ data, project_id }) => ({
        url: `compta/CompteResultats/manual/?project_id=${project_id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["compta"],
    }),
  }),
});

export const { useGetChiffreAffaireMensuelQuery, useGetChiffreAffaireAnnuelQuery, useSaveBilanManualMutation, useSaveCompteResultatManualMutation } = comptaApiSlice;
