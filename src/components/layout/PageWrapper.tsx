"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <main
            style={{
                position: "relative",
                zIndex: 1,
                paddingTop: isHome ? 0 : "100px",
            }}
        >
            {children}
        </main>
    );
}
