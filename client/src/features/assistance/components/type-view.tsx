import { useState } from "react";
import ActionIcon from "../../../components/widgets/action-icon";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import EmptyState from "../../../components/widgets/empty";

const TypeView = () => {

    return ( 
            <div className="flex flex-col gap-6 max-w-4xl">
                <div className="space-y-4">
                      {/* <div className="bg-muted/50 rounded-sm overflow-hidden py-2 px-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-lg">Monetary</h3>
                                    <p className="font-medium text-sm text-gray-500">USD</p>
                                </div>
                                <div className="flex space-x-3">
                                    <ActionIcon name="edit" />
                                    <ActionIcon name="trash" />
                                </div>
                            </div>
                      </div> */}
                      <div className="flex flex-row h-[70vh] items-center">
                        <EmptyState 
                            variant="empty"
                            title="No Assistance Found"
                            />
                      </div>

                </div>
            </div>
     );
}
 
export default TypeView;