import { jsx as _jsx } from "react/jsx-runtime";
// export default function GuestLayout({ children }: PropsWithChildren) {
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
//             <div className="w-full sm:max-w-md mt-6">
//                 {children}
//             </div>
//         </div>
//     );
// }
export default function Guest({ children }) {
    return (
    // <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
    //     <div>
    //         <Link href="/">
    //             <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
    //         </Link>
    //     </div>
    //     <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
    //         {children}
    //     </div>
    // </div>
    _jsx("div", { className: "min-h-screen  flex flex-col sm:justify-center items-center pt-6 sm:pt-0", children: _jsx("div", { className: "w-full sm:max-w-md mt-6", children: children }) }));
}
