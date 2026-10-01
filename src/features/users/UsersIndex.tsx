import { useUsers, useUserMutations } from '@/features/users/useUsers'
import type { TableColumn } from '@/components/Table/types'
import type { User } from '@/features/users/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery'
import { batchDelete } from '@/components/Table/util.tsx'
import UserForm from '@/features/users/UserForm.tsx'

const UsersIndex = () => {
  const query = useTableQuery()

  const {
    collection: users = [],
    server,
    formItem: formUser,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    [ 'Usuario', 'm' ],
    useUsers(query),
    useUserMutations(),
    query
  )

  // TODO: check the columns. `sortKey` is what the api calls the column
  const columns: TableColumn<User>[] = [
    { name: 'Nombre', accessor: 'fullName', sortKey: 'full_name' },
    { name: 'Rol', accessor: 'role', sortKey: 'role' },
    { name: 'Email', accessor: 'email', sortKey: 'email' },
  ]

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <IndexNavBar label='Usuarios' createLabel='Crear usuario' form={ formUser } className='xl:hidden' />

        <UserForm
          name='mobile-user'
          className='xl:hidden'
          user={ formUser.get() || {} }
          onCancel={() => formUser.set(null)}
        />

        <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
          <div className='lg:flex-1'>
            <Table
              collection={ users }
              server={ server }
              isLoading={ isLoading }
              columns={ columns }
              noEntriesMessage='No hay usuarios'
              selectable={ true }
              actions={[
                { label: 'Editar', icon: <Pencil />, action: id => formUser.set(id) },
                { label: 'Eliminar', icon: <Trash />, action: id => remove(id), destructive: true },
              ]}
              selectionActions={removeAll
                ? [batchDelete<User>(removeAll, 'Usuarios eliminados')]
                : []
              }
            />
          </div>
          <div className='lg:flex-1'>
            <UserForm
              name='desktop-user'
              className='hidden xl:block xl:flex-1'
              user={ formUser.get() || {} }
              onCancel={() => formUser.set(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersIndex
