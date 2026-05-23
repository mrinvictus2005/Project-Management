import React from "react"
import { useForm } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import ModalWrapper from "./ModalWrapper"
import { Dialog } from "@headlessui/react"
import Textbox from "./Textbox"
import Loading from "./Loader"
import Button from "./Button"
import { useRegisterMutation } from "../redux/slices/api/authApiSlice"
import { toast } from "sonner"
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice"
import { setCredentials } from "../redux/slices/authSlice"

const AddUser = ({ open, setOpen, userData, onSuccess }) => {
    let defaultValues = userData ?? {}
    const { user } = useSelector((state) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues })

    const dispatch = useDispatch()

    const [addNewUser, { isLoading }] = useRegisterMutation()
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

    const handleOnSubmit = async (data) => {
        try {
            if (userData) {
                const result = await updateUser(data).unwrap()

                toast.success("Profile updated successfully.")

                if (userData?._id === user._id) {
                    dispatch(setCredentials({ ...result.user }))
                }
            } else {
                await addNewUser({
                    ...data,
                    isAdmin: data.accountType === "admin",
                }).unwrap()

                toast.success("New user added successfully.")
            }

            onSuccess?.()

            setTimeout(() => {
                setOpen(false)
            }, 1500)
        } catch (error) {
            toast.error(error?.data?.message || error.message || "Something went wrong.")
        }
    }

    return (
        <>
            <ModalWrapper open={open} setOpen={setOpen}>
                <form onSubmit={handleSubmit(handleOnSubmit)} className="">
                    <Dialog.Title
                        as="h2"
                        className="text-base font-bold leading-6 text-gray-900 mb-4"
                    >
                        {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col gap-6">
                        <Textbox
                            placeholder="Full name"
                            type="text"
                            name="name"
                            label="Full Name"
                            className="w-full rounded"
                            register={register("name", {
                                required: "Full name is required!",
                            })}
                            error={errors.name ? errors.name.message : ""}
                        />
                        <Textbox
                            placeholder="Title"
                            type="text"
                            name="title"
                            label="Title"
                            className="w-full rounded"
                            register={register("title", {
                                required: "Title is required!",
                            })}
                            error={errors.title ? errors.title.message : ""}
                        />
                        <Textbox
                            placeholder="Email Address"
                            type="email"
                            name="email"
                            label="Email Address"
                            className="w-full rounded"
                            register={register("email", {
                                required: "Email Address is required!",
                            })}
                            error={errors.email ? errors.email.message : ""}
                        />

                        {!userData && (
                            <Textbox
                                placeholder="Initial password"
                                type="password"
                                name="password"
                                label="Initial Password"
                                className="w-full rounded"
                                register={register("password", {
                                    required: "Initial password is required!",
                                    minLength: {
                                        value: 6,
                                        message:
                                            "Password must be at least 6 characters.",
                                    },
                                })}
                                error={
                                    errors.password
                                        ? errors.password.message
                                        : ""
                                }
                            />
                        )}

                        <Textbox
                            placeholder="Role"
                            type="text"
                            name="role"
                            label="Role"
                            className="w-full rounded"
                            register={register("role", {
                                required: "User role is required!",
                            })}
                            error={errors.role ? errors.role.message : ""}
                        />

                        {!userData && (
                            <div>
                                <label className="text-slate-800">
                                    Account Type
                                </label>
                                <select
                                    className="w-full rounded bg-white px-3 py-2.5 border border-gray-300 text-gray-900 outline-none focus:ring-2 ring-blue-300"
                                    {...register("accountType")}
                                    defaultValue="member"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {isLoading || isUpdating ? (
                        <div className="py-5">
                            <Loading />
                        </div>
                    ) : (
                        <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
                            <Button
                                type="submit"
                                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                                label="Submit"
                            />

                            <Button
                                type="button"
                                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                                onClick={() => setOpen(false)}
                                label="Cancel"
                            />
                        </div>
                    )}
                </form>
            </ModalWrapper>
        </>
    )
}

export default AddUser
