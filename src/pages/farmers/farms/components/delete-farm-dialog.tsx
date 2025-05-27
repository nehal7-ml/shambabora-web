
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFarm, deleteFarmerHarvests } from '@/helpers/api-helper'
import { useAppDispatch } from '@/hooks/store-hooks'
import { addAlert } from '@/store/slices/elert-slice'

interface DeleteDialogProps {
  id: any
  farmerId: string
  name: string | any
  onClose: () => void
}

const DeleteDialog = ({ id, name, farmerId, onClose }: DeleteDialogProps) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await deleteFarm(id, "")
    },
    onSuccess: () => {
      dispatch(
        addAlert({
          message: 'Record deleted successfully!',
          title: 'Delete Success',
          type: 'success',
        })
      )
      queryClient.invalidateQueries({ queryKey: ['farms', farmerId] })
      onClose()
    },
    onError: (error: any) => {
      dispatch(
        addAlert({
          message: error.message || 'Something went wrong!',
          title: 'Delete Failed',
          type: 'error',
        })
      )
    },
  })

  const handleDelete = () => {
    mutation.mutate()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="btn-danger"
            loading={mutation.isPending}
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDialog
