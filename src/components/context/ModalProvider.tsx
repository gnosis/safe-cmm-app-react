import { GenericModal, Loader } from "@gnosis.pm/safe-react-components";
import { Box, Typography } from "@material-ui/core";
import { noop } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { promisify } from "util";
import { asPromise } from "utils/asPromise";

export interface ModalContextProps {
  openModal: (modalName: string, props: any) => Promise<void>;
}

export const ModalContext = React.createContext<ModalContextProps>({
  openModal: () =>
    Promise.reject(
      "Provider not loaded. Did you forget to include the Provider?"
    ),
});

interface ProviderProps {
  children: React.ReactNode;
}

type StatusEnum = "LOADING" | "ERROR" | "SUCCESS";

const globalModalModules = {};
const loadCachedModalModule = async (modalName): Promise<any> => {
  if (!globalModalModules[modalName]) {
    globalModalModules[modalName] = import(`../modal/${modalName}`).then(
      // Modals export ModalName named export
      (modalModule) => {
        if (modalModule[modalName]) {
          // TODO: Add default footer
          return { Body: modalModule[modalName] };
        }

        return {
          Body: modalModule["Body"],
          Footer: modalModule["Footer"],
        };
      }
    );
    console.log(globalModalModules[modalName]);
  }
  return globalModalModules[modalName];
};

export const ModalProvider = ({ children }: ProviderProps): JSX.Element => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalSettingProps, setModalSettingProps] = useState<
    Record<string, any>
  >({});

  const [status, setStatus] = useState<StatusEnum>("LOADING");
  const [modalComponents, setModalComponents] = useState(null);
  const [confirmHandler, setConfirmHandler] = useState<
    () => Promise<boolean> | boolean
  >(null);

  const handleOnClose = useCallback(() => {
    handleTriggerReject();
  }, []);

  const handleOpenModal = useCallback(async (modalName, props): Promise<
    void
  > => {
    setActiveModal(modalName);

    try {
      setStatus("LOADING");
      const newModalComponents = await loadCachedModalModule(modalName);
      setStatus("SUCCESS");
      setModalSettingProps(props);
      setModalComponents(newModalComponents);
    } catch (err) {
      setStatus("ERROR");
      setModalSettingProps({});
    }
  }, []);

  const value = useMemo(
    () => ({
      openModal: handleOpenModal,
    }),
    [handleOpenModal]
  );

  const handleSetConfirmHandler = useCallback(
    (cb: () => Promise<boolean> | boolean) => {
      setConfirmHandler(cb);
    },
    []
  );

  const handleTriggerConfirm = useCallback(async () => {
    if (typeof modalSettingProps.onConfirm === "function") {
      if (typeof confirmHandler === "function") {
        const stopSubmit: boolean = await asPromise(confirmHandler());

        if (stopSubmit) return;
      }

      modalSettingProps.onConfirm();
    }

    setActiveModal(null);
    setModalSettingProps({});
    setModalComponents(null);
  }, [confirmHandler, modalSettingProps]);
  const handleTriggerReject = useCallback(async () => {
    if (typeof modalSettingProps.onReject === "function") {
      if (typeof confirmHandler === "function") {
        const stopSubmit: boolean = await asPromise(confirmHandler());

        if (stopSubmit) return;
      }

      modalSettingProps.onReject();
    }

    setActiveModal(null);
    setModalSettingProps({});
    setModalComponents(null);
  }, [confirmHandler, modalSettingProps]);

  let modalBody = (
    <Box>
      <Loader size="lg" />
    </Box>
  );
  let modalFooter = null;

  const { title, ...componentProps } = modalSettingProps;
  if (status === "SUCCESS" && modalComponents) {
    modalBody = (
      <modalComponents.Body
        {...componentProps}
        setConfirmHandler={handleSetConfirmHandler}
      />
    );
    if (modalComponents.Footer) {
      modalFooter = (
        <modalComponents.Footer
          {...componentProps}
          triggerConfirm={handleTriggerConfirm}
          triggerReject={handleTriggerReject}
        />
      );
    }
  }
  if (status === "ERROR") {
    modalBody = (
      <Box>
        <Typography color="error">
          Something went wrong. Please try again later
        </Typography>
      </Box>
    );
  }

  return (
    <ModalContext.Provider value={value}>
      {activeModal != null && (
        <GenericModal
          onClose={handleOnClose}
          title={title || "Welcome"}
          body={modalBody}
          footer={modalFooter}
        />
      )}
      {children}
    </ModalContext.Provider>
  );
};
