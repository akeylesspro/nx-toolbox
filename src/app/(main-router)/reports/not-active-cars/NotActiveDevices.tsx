"use client";
import { TObject } from "akeyless-types-commons";
import React, { useEffect } from "react";
import { NotActiveTable } from "./components";

function NotActiveDevices({ data }: { data: TObject<any>[] }) {
    return <NotActiveTable data={data} />;
}

export default NotActiveDevices;
