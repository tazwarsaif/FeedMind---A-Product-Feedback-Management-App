import { Head } from "@inertiajs/react";

const Header = ({ title }) => {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={`Page - ${title}`} />
        </Head>
    );
};

export default Header;
