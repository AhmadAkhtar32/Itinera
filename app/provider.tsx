import React from 'react'

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>{children}</div>
    )
}

export default Provider