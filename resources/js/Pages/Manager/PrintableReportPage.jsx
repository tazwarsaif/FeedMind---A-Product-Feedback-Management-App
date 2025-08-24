import PrintableReport from "../components/PrintableReport";

const PrintableReportPage = ({ product, ratingStats }) => {
    return (
        <div>
            <PrintableReport product={product} ratingStats={ratingStats} />
        </div>
    );
};

export default PrintableReportPage;
