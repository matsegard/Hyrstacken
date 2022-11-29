import { InferGetServerSidePropsType, NextPage } from "next";
import prisma from "../lib/prisma";
import ItemForm from "../components/Forms/ItemForm";
import Head from "next/head";

export async function getServerSideProps() {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
        },
    });
    return {
        props: {
            categories,
        },
    };
}

const CreateItem: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ categories }) => {
    return (
        <>
            <Head>
                <title>Hyrstacken - Skapa Annons</title>
                <meta name="description" content="Skapa en ny annons" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col items-center justify-center w-full h-fit smallPhone:h-screen font-nunito">
                <ItemForm categories={categories} />
            </div>
        </>
    );
};

export default CreateItem;
