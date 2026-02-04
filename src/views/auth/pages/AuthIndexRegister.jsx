import React from "react";
import RegisterForm from "./form/RegisterForm";
import UtilsPageMeta from "../../../components/meta/UtilsPageMeta";

export default function AuthIndexRegister() {
    return (
        <React.Fragment>
            <UtilsPageMeta
                title={"Vulca | Inscription"}
                description={"Authentication page."}
            />
            <RegisterForm />
        </React.Fragment>
    );
}
