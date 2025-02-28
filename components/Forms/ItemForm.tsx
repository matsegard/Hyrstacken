import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { itemSchema } from "../../lib/schemas";
import CrossIcon from "../../assets/cross.svg";
import Loader from "../Loader/Loader";
import FormLabel from "../FormLabel/FormLabel";
import router from "next/router";
import { useSession } from "next-auth/react";

type ItemFormProps = {
    categories: {
        id: string;
        name: string;
    }[];
    product?: {
        id: string;
        title: string;
        description: string;
        picePerDay: number;
        imageUrl: string | null;
        categoryId: string;
        locationId: string;
        owner: {
            id: string;
            name: string | null;
            image: string | null;
        };
    };
    locations: {
        id: string;
        name: string;
    }[];
};

const ItemForm = ({ categories, product, locations }: ItemFormProps) => {
    const [fetchError, setFetchError] = useState<boolean>(false);
    const [id, setId] = useState<string>();

    useEffect(() => {
        if (product) {
            fetch("/api/getSessionUser", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(async (data) => {
                    const user = await data.json();
                    setId(user.id);
                })
                .catch((e) => console.log(e));
        }
    }, [product]);

    const { data: session } = useSession();
    const ownItem = id === product?.owner.id;
    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors, isSubmitting, isValid },
    } = useForm<z.infer<typeof itemSchema>>({
        mode: "onChange",
        resolver: zodResolver(itemSchema),
    });

    const onSubmit = handleSubmit(async (data) => {
        if (product) {
            data.id = product.id;
            const resp = await fetch("/api/updateItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            setFetchError(resp.ok === false);
            const body = await resp.json();
            resp.ok && (await router.push(`/product/${body.id}`));
        } else {
            const resp = await fetch("/api/createItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            setFetchError(resp.ok === false);
            const body = await resp.json();
            resp.ok && (await router.push(`/product/${body.id}`));
        }
    });

    return isSubmitting ? (
        <div className="grid h-screen place-content-center">
            <Loader />
        </div>
    ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-screen font-bold gap-y-5">
            <p>Något gick tyvärr fel...</p>
            <button
                onClick={() => {
                    setFetchError(false);
                }}
                className="text-white border-0 btn bg-softRed"
            >
                Försök igen
            </button>
        </div>
    ) : !session || (product && !ownItem) ? (
        <div className="flex flex-col items-center justify-center h-screen font-bold gap-y-5">
            <p>Du har inte tillgång till denna sidan...</p>
            <button
                onClick={() => {
                    router.back();
                }}
                className="text-white border-0 btn bg-softRed"
            >
                Gå tillbaka
            </button>
        </div>
    ) : (
        <form
            onSubmit={onSubmit}
            className="container flex flex-col w-full h-full p-5 justify-evenly min-[640px]:p-10"
        >
            <h1 className="text-2xl font-bold text-veryDarkBlue">
                {ownItem && product ? "Redigera din" : "Skapa"} annons
            </h1>
            <div className="relative flex flex-col my-3 gap-y-3">
                <FormLabel required>Titel</FormLabel>
                <input
                    placeholder="Skiftnyckel"
                    {...register("title", { required: "Måste ha en titel" })}
                    className="pl-2 pr-10 font-bold border-b-[1px] h-9 border-veryDarkBlue"
                    defaultValue={product ? product.title : undefined}
                />
                <CrossIcon
                    onClick={() => resetField("title")}
                    className="absolute right-3  top-[65%] cursor-pointer"
                />
            </div>
            {errors.title && (
                <span className="text-error">{errors.title?.message}</span>
            )}
            <div className="relative flex flex-col my-3 gap-y-3">
                <FormLabel>Bild-URL</FormLabel>

                <input
                    {...register("imageUrl")}
                    placeholder="https://dinbild.se/din-bild"
                    className="pl-2 pr-10 font-bold border-b-[1px] h-9 border-veryDarkBlue"
                    defaultValue={
                        product ? product.imageUrl || undefined : undefined
                    }
                />
                <CrossIcon
                    onClick={() => resetField("imageUrl")}
                    className="absolute right-3  top-[65%] cursor-pointer"
                />
            </div>
            <div className="relative flex flex-col my-3 gap-y-3">
                <FormLabel required>Pris per dag</FormLabel>

                <input
                    placeholder="10"
                    className="pl-2 pr-10 font-bold border-b-[1px] h-9 border-veryDarkBlue"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    defaultValue={product ? product.picePerDay : undefined}
                />
                <CrossIcon
                    onClick={() => resetField("price")}
                    className="absolute right-3  top-[65%] cursor-pointer"
                />
            </div>
            {errors.price && (
                <span className="text-error">{errors.price?.message}</span>
            )}
            <div className="flex flex-col my-3 gap-y-3">
                <FormLabel required>Beskrivning</FormLabel>

                <textarea
                    {...register("description")}
                    className="textarea px-2 border-[1px] font-nunito text-[#000] border-veryDarkBlue leading-snug"
                    placeholder="Denna skiftnyckel köptes in för tre år sedan och är i mycket bra skick..."
                    rows={4}
                    defaultValue={product ? product.description : undefined}
                />
            </div>
            {errors.description && (
                <span className="text-error">
                    {errors.description?.message}
                </span>
            )}
            <div className="flex flex-col my-3 gap-y-3">
                <FormLabel required>Kategori</FormLabel>

                <select
                    id=""
                    className=" select  border-veryDarkBlue border-[1px]"
                    {...register("categoryId")}
                    defaultValue={product ? product.categoryId : ""}
                >
                    <option disabled value="">
                        Välj kategori
                    </option>
                    {categories.map((category) => {
                        return (
                            <option
                                key={category.id}
                                defaultChecked={
                                    category.id === product?.categoryId
                                }
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        );
                    })}
                </select>
            </div>
            {errors.categoryId && (
                <span className="text-error">{errors.categoryId?.message}</span>
            )}
            <div className="flex flex-col my-3 gap-y-3">
                <FormLabel required>Stadsdel</FormLabel>
                <select
                    id=""
                    className=" select  border-veryDarkBlue border-[1px]"
                    {...register("locationId")}
                    defaultValue={product ? product.locationId : ""}
                >
                    <option disabled value="">
                        Välj stadsdel
                    </option>
                    {locations.map((location) => {
                        return (
                            <option
                                key={location.id}
                                defaultChecked={
                                    location.id === product?.locationId
                                }
                                value={location.id}
                            >
                                {location.name}
                            </option>
                        );
                    })}
                </select>
            </div>
            {errors.locationId && (
                <span className="text-error">{errors.locationId?.message}</span>
            )}
            <input
                type="submit"
                value={isValid ? "Skicka" : "Fyll i obligatoriska fält"}
                className={`my-4 text-white border-0 btn bg-softRed ${
                    !isValid && "btn-disabled opacity-50"
                }`}
            />
        </form>
    );
};

export default ItemForm;
