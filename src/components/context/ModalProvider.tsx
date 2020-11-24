import { GenericModal, Loader } from "@gnosis.pm/safe-react-components";
import { Box, Typography } from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";

export interface ModalContextProps {
  openModal: (modalName: string, props: any) => Promise<void>;
}

export const ModalContext = React.createContext<ModalContextProps>({
  openModal: () => Promise.resolve(),
});

interface ProviderProps {
  children: React.ReactNode;
}

type StatusEnum = "LOADING" | "ERROR" | "SUCCESS";

const globalModalModules = {};
const loadCachedModalModule = async (modalName): Promise<any> => {
  if (!globalModalModules[modalName]) {
    globalModalModules[modalName] = (
      await import("components/modals/" + modalName)
    )
      // Modals export ModalName named export
      .then((modalModule) => modalModule[modalName]);
  }
  return globalModalModules[modalName];
};

export const ModalProvider = ({ children }: ProviderProps): JSX.Element => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalSettingProps, setModalSettingProps] = useState<
    Record<string, any>
  >({});

  const [status, setStatus] = useState<StatusEnum>("LOADING");
  const [ModalComponent, setModalComponent] = useState(null);

  const handleOnClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleOpenModal = useCallback(async (modalName, props): Promise<
    void
  > => {
    setActiveModal(modalName);

    try {
      setStatus("LOADING");
      const newModalComponent = await loadCachedModalModule(modalName);
      setStatus("SUCCESS");
      setModalSettingProps(props);
      setModalComponent(newModalComponent);
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

  let modalBody = (
    <Box>
      <Loader size="lg" />
    </Box>
  );

  const { title, ...componentProps } = modalSettingProps;
  if (status === "LOADING") {
    modalBody = <ModalComponent {...componentProps} />;
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
      {activeModal && (
        <GenericModal
          onClose={handleOnClose}
          title={title || "Welcome"}
          body={modalBody}
        />
      )}
      {children}
    </ModalContext.Provider>
  );
};
